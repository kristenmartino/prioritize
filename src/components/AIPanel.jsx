import { useState } from "react";
import { C } from "../theme";
import { Pill } from "./Pill";

const demoAnalysis = (scored) => {
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const quickWin = sorted.find(f => f.effort <= 40 && f.impact >= 40) || sorted[1];
  const risky = sorted.find(f => f.confidence <= 60) || lowest;

  return {
    summary: `This backlog contains ${sorted.length} features with RICE scores ranging from ${lowest.score.toLocaleString()} to ${top.score.toLocaleString()}. The distribution suggests a healthy mix of quick wins and strategic investments, though confidence levels on some items warrant validation.`,
    topPick: { name: top.name, reason: `Highest RICE score (${top.score.toLocaleString()}) with strong reach and impact metrics, making it the highest-leverage investment in the current backlog.` },
    quickWin: { name: quickWin.name, reason: `Relatively low effort (${quickWin.effort}/100) with meaningful impact — delivers visible value to users quickly and builds team momentum.` },
    riskFlag: { name: risky.name, reason: `Confidence score of ${risky.confidence}/100 suggests insufficient validation. Consider running user research or a prototype test before committing engineering resources.` },
    sprintPlan: sorted.slice(0, Math.min(3, sorted.length)).map(f => f.name),
    insight: `The top-ranked features share a pattern of high reach but varying confidence. Investing in lightweight validation (surveys, prototypes) for lower-confidence items could significantly improve prioritization accuracy before committing to full builds.`,
  };
};

export const AIPanel = ({ scored, productContext, onAnalysisEvent, onAnalysisFeedback, feedbackContext }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [thumbs, setThumbs] = useState(null);

  const runAnalysis = async () => {
    setLoading(true); setError(null); setThumbs(null); setEventId(null);
    const startTime = Date.now();
    try {
      const sorted = [...scored].sort((a, b) => b.score - a.score);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: sorted, productContext, feedbackContext }),
      });
      const elapsed = Date.now() - startTime;
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        setMode("live");
        if (onAnalysisEvent) {
          const id = await onAnalysisEvent({ feature_count: sorted.length, mode: "live", response_ms: elapsed, top_pick: data.topPick?.name, quick_win: data.quickWin?.name, risk_flag: data.riskFlag?.name, error: false });
          setEventId(id);
        }
      } else {
        throw new Error("API unavailable");
      }
    } catch {
      const elapsed = Date.now() - startTime;
      const demoResult = demoAnalysis(scored);
      setAnalysis(demoResult);
      setMode("demo");
      if (onAnalysisEvent) {
        const id = await onAnalysisEvent({ feature_count: scored.length, mode: "demo", response_ms: elapsed, top_pick: demoResult.topPick?.name, quick_win: demoResult.quickWin?.name, risk_flag: demoResult.riskFlag?.name, error: false });
        setEventId(id);
      }
    }
    setLoading(false);
  };

  const handleThumbs = (isUp) => {
    setThumbs(isUp);
    if (onAnalysisFeedback && eventId) {
      onAnalysisFeedback(eventId, isUp);
    }
  };

  if (!analysis && !loading) {
    return (
      <button onClick={runAnalysis} disabled={scored.length < 2}
        style={{ width: "100%", padding: "14px 20px", border: `1px solid ${C.accent}40`, borderRadius: 10, background: C.accentGlow, color: C.accent, fontSize: 13, fontWeight: 600, cursor: scored.length < 2 ? "not-allowed" : "pointer", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.03em", transition: "all 0.2s", opacity: scored.length < 2 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        onMouseEnter={e => { if (scored.length >= 2) e.target.style.background = C.accentDim; }}
        onMouseLeave={e => e.target.style.background = C.accentGlow}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Run AI Strategy Analysis
      </button>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 24, border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, textAlign: "center" }}>
        <div style={{ display: "inline-block", width: 24, height: 24, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 12, fontFamily: "'JetBrains Mono', monospace" }}>Analyzing backlog strategy...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16, border: `1px solid ${C.danger}30`, borderRadius: 10, background: C.dangerDim }}>
        <p style={{ fontSize: 12, color: C.danger, margin: 0 }}>{error}</p>
        <button onClick={runAnalysis} style={{ marginTop: 10, padding: "6px 14px", border: `1px solid ${C.danger}40`, borderRadius: 6, background: "transparent", color: C.danger, fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>Retry</button>
      </div>
    );
  }

  const cards = [
    { icon: "🎯", label: "TOP PRIORITY", value: analysis.topPick?.name, detail: analysis.topPick?.reason, color: C.accent },
    { icon: "⚡", label: "QUICK WIN", value: analysis.quickWin?.name, detail: analysis.quickWin?.reason, color: C.warn },
    { icon: "⚠️", label: "RISK FLAG", value: analysis.riskFlag?.name, detail: analysis.riskFlag?.reason, color: C.danger },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {mode === "demo" && (
        <div style={{ padding: "8px 12px", borderRadius: 8, background: C.purpleDim, border: `1px solid ${C.purple}30` }}>
          <span style={{ fontSize: 10, color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>DEMO MODE — Analysis generated locally. Set up API proxy for live Claude analysis.</span>
        </div>
      )}
      <div style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface }}>
        <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0 }}>{analysis.summary}</p>
      </div>
      {cards.map((c, i) => (
        <div key={i} style={{ padding: 14, border: `1px solid ${c.color}20`, borderRadius: 10, background: `${c.color}08`, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18 }}>{c.icon}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: c.color, letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" }}>{c.label}</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: "3px 0 2px" }}>{c.value}</p>
            <p style={{ fontSize: 11, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{c.detail}</p>
          </div>
        </div>
      ))}
      {analysis.sprintPlan && (
        <div style={{ padding: 14, border: `1px solid ${C.blue}20`, borderRadius: 10, background: `${C.blue}08` }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.blue, letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" }}>📋 RECOMMENDED SPRINT ORDER</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {analysis.sprintPlan.map((name, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.blue, background: C.blueDim, fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</span>
                <span style={{ fontSize: 12, color: C.text }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {analysis.insight && (
        <div style={{ padding: 14, border: `1px solid ${C.purple}20`, borderRadius: 10, background: `${C.purple}08` }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.purple, letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" }}>💡 STRATEGIC INSIGHT</span>
          <p style={{ fontSize: 12, color: C.text, margin: "6px 0 0", lineHeight: 1.6 }}>{analysis.insight}</p>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => { setAnalysis(null); setThumbs(null); setEventId(null); }} style={{ padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>↻ Re-analyze</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'JetBrains Mono', monospace", marginRight: 4 }}>Helpful?</span>
          <button onClick={() => handleThumbs(true)}
            style={{ padding: "4px 8px", border: `1px solid ${thumbs === true ? C.accent : C.border}`, borderRadius: 6, background: thumbs === true ? C.accentGlow : "transparent", color: thumbs === true ? C.accent : C.textMuted, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
            👍
          </button>
          <button onClick={() => handleThumbs(false)}
            style={{ padding: "4px 8px", border: `1px solid ${thumbs === false ? C.danger : C.border}`, borderRadius: 6, background: thumbs === false ? C.dangerDim : "transparent", color: thumbs === false ? C.danger : C.textMuted, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
            👎
          </button>
        </div>
      </div>
    </div>
  );
};
