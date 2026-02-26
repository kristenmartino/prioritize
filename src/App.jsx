import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const STORAGE_KEY = "prioritize-features-v1";

// ─── Theme ───────────────────────────────────────────────────────────
const C = {
  bg: "#0C0F14", surface: "#141820",
  border: "#1E2430", borderActive: "#2A3140",
  text: "#E8ECF2", textMuted: "#6B7A90", textDim: "#3D4A5C",
  accent: "#4ADE80", accentDim: "#4ADE8030", accentGlow: "#4ADE8018",
  danger: "#F87171", dangerDim: "#F8717120",
  warn: "#FBBF24", warnDim: "#FBBF2420",
  blue: "#60A5FA", blueDim: "#60A5FA20",
  purple: "#A78BFA", purpleDim: "#A78BFA20",
};

const QUADRANT_LABELS = [
  { label: "Quick Wins", sub: "High Impact · Low Effort", x: 0.25, y: 0.82, color: C.accent },
  { label: "Strategic Bets", sub: "High Impact · High Effort", x: 0.75, y: 0.82, color: C.blue },
  { label: "Low Hanging Fruit", sub: "Low Impact · Low Effort", x: 0.25, y: 0.18, color: C.warn },
  { label: "Money Pits", sub: "Low Impact · High Effort", x: 0.75, y: 0.18, color: C.danger },
];

const SAMPLES = [
  { id: "r20", name: "Feature Editing", description: "Modify RICE scores post-creation — users discover scoring errors after initial input and need to adjust without deleting and recreating", reach: 95, impact: 70, confidence: 95, effort: 15 },
  { id: "r21", name: "Export to CSV/PDF", description: "Generate formatted exports for stakeholder distribution — PMs need to share rankings outside the tool in Slack, decks, and emails", reach: 75, impact: 65, confidence: 85, effort: 35 },
  { id: "r23", name: "Drag-and-Drop Reorder", description: "Manual reordering with score override when strategic judgment disagrees with RICE — visual indicator distinguishes overridden items", reach: 60, impact: 75, confidence: 60, effort: 55 },
  { id: "r22", name: "Multiple Workspaces", description: "Named backlog workspaces for PMs managing multiple product areas simultaneously with workspace switching and storage partitioning", reach: 50, impact: 60, confidence: 70, effort: 45 },
  { id: "r24", name: "Jira/Linear Import", description: "CSV or API import from existing project trackers to reduce data entry — field mapping varies across orgs, auth flows add complexity", reach: 40, impact: 55, confidence: 50, effort: 70 },
  { id: "r25", name: "Team Collaboration", description: "Shared workspaces with real-time multi-user access, conflict resolution, and permissions — the killer feature for product teams at scale", reach: 35, impact: 80, confidence: 35, effort: 90 },
  { id: "r26", name: "Historical Trend Tracking", description: "Versioned score history with timeline visualization — enables retrospective analysis of whether priorities actually shifted over time", reach: 30, impact: 50, confidence: 40, effort: 65 },
];

// ─── Utilities ───────────────────────────────────────────────────────
const rice = (f) => Math.round((f.reach * f.impact * f.confidence) / Math.max(f.effort, 1));
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

const getTier = (f) => {
  if (f.effort <= 50 && f.impact > 50) return { color: C.accent, label: "QUICK WIN" };
  if (f.effort > 50 && f.impact > 50) return { color: C.blue, label: "STRATEGIC" };
  if (f.effort <= 50 && f.impact <= 50) return { color: C.warn, label: "LOW HANG" };
  return { color: C.danger, label: "MONEY PIT" };
};

const save = (features) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(features)); } catch {} };
const load = () => { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; } };

// ─── Hooks ───────────────────────────────────────────────────────────
const useMedia = (q) => {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const mql = window.matchMedia(q);
    const h = (e) => setM(e.matches);
    mql.addEventListener("change", h);
    setM(mql.matches);
    return () => mql.removeEventListener("change", h);
  }, [q]);
  return m;
};

const useScored = (features) => useMemo(() => {
  const scored = features.map(f => ({ ...f, score: rice(f) }));
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const maxScore = sorted.length > 0 ? sorted[0].score : 1;
  return { scored, sorted, maxScore };
}, [features]);

// ─── Demo Fallback AI ────────────────────────────────────────────────
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

// ─── Micro Components ────────────────────────────────────────────────
const Pill = ({ children, color, dimColor, small }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: small ? "2px 8px" : "3px 10px", borderRadius: 20, fontSize: small ? 10 : 11, fontWeight: 600, color, background: dimColor, letterSpacing: "0.04em", fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>
);

const ScoreBar = ({ value, color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 10, color: C.textMuted, width: 16, textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
    <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
    </div>
    <span style={{ fontSize: 10, color: C.textMuted, width: 22, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
  </div>
);

const Slider = ({ label, value, onChange, color, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{icon} {label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
    <input type="range" min={1} max={100} value={value} onChange={(e) => onChange(parseInt(e.target.value))} style={{ width: "100%", height: 6, appearance: "none", background: `linear-gradient(to right, ${color} ${value}%, ${C.border} ${value}%)`, borderRadius: 3, outline: "none", cursor: "pointer", accentColor: color }} />
  </div>
);

// ─── Priority Matrix ─────────────────────────────────────────────────
const PAD = { top: 40, right: 30, bottom: 50, left: 50 };

const Matrix = ({ scored, maxScore, selectedId, onSelect }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [dims, setDims] = useState({ w: 600, h: 420 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDims({ w: width, h: Math.min(420, width * 0.65) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const positions = useMemo(() => {
    const pw = dims.w - PAD.left - PAD.right;
    const ph = dims.h - PAD.top - PAD.bottom;
    return scored.map(f => ({ id: f.id, x: PAD.left + (f.effort / 100) * pw, y: dims.h - PAD.bottom - (f.impact / 100) * ph }));
  }, [scored, dims]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    ctx.scale(dpr, dpr);
    const pw = dims.w - PAD.left - PAD.right;
    const ph = dims.h - PAD.top - PAD.bottom;
    ctx.clearRect(0, 0, dims.w, dims.h);

    // Grid
    ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    for (let i = 0; i <= 4; i++) {
      const x = PAD.left + (pw / 4) * i, y = PAD.top + (ph / 4) * i;
      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, dims.h - PAD.bottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(dims.w - PAD.right, y); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Dividers
    const mx = PAD.left + pw / 2, my = PAD.top + ph / 2;
    ctx.strokeStyle = C.borderActive; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(mx, PAD.top); ctx.lineTo(mx, dims.h - PAD.bottom); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD.left, my); ctx.lineTo(dims.w - PAD.right, my); ctx.stroke();
    ctx.setLineDash([]);

    // Quadrant labels
    ctx.font = "600 10px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
    QUADRANT_LABELS.forEach(q => {
      ctx.fillStyle = q.color + "40";
      ctx.fillText(q.label.toUpperCase(), PAD.left + pw * q.x, PAD.top + ph * (1 - q.y) + 1);
      ctx.font = "400 9px 'JetBrains Mono', monospace"; ctx.fillStyle = q.color + "25";
      ctx.fillText(q.sub, PAD.left + pw * q.x, PAD.top + ph * (1 - q.y) + 14);
      ctx.font = "600 10px 'JetBrains Mono', monospace";
    });

    // Axes
    ctx.font = "600 10px 'JetBrains Mono', monospace"; ctx.fillStyle = C.textMuted; ctx.textAlign = "center";
    ctx.fillText("EFFORT →", dims.w / 2, dims.h - 8);
    ctx.save(); ctx.translate(14, dims.h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("IMPACT →", 0, 0); ctx.restore();
    ctx.font = "400 9px 'JetBrains Mono', monospace"; ctx.fillStyle = C.textDim; ctx.textAlign = "center";
    for (let i = 0; i <= 4; i++) ctx.fillText(i * 25, PAD.left + (pw / 4) * i, dims.h - PAD.bottom + 16);
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) ctx.fillText(i * 25, PAD.left - 8, dims.h - PAD.bottom - (ph / 4) * i + 3);

    // Points
    scored.forEach((f, idx) => {
      const { x, y } = positions[idx];
      const isSel = f.id === selectedId, isHov = f.id === hovered;
      const r = isSel ? 10 : isHov ? 9 : 7;
      const col = getTier(f).color;
      if (isSel || isHov) { ctx.beginPath(); ctx.arc(x, y, r + 8, 0, Math.PI * 2); ctx.fillStyle = col + "20"; ctx.fill(); }
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = C.surface; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = isSel ? 2.5 : 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      if (isSel || isHov) {
        const lbl = f.name.length > 20 ? f.name.slice(0, 18) + "…" : f.name;
        ctx.font = "600 10px 'JetBrains Mono', monospace"; const tw = ctx.measureText(lbl).width;
        const lx = clamp(x - tw / 2 - 6, 2, dims.w - tw - 14), ly = y - r - 14;
        ctx.fillStyle = C.surface + "F0"; ctx.strokeStyle = col + "50"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(lx, ly - 12, tw + 12, 18, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(lbl, lx + 6, ly + 1);
      }
    });
  }, [scored, maxScore, positions, selectedId, hovered, dims]);

  const handleEvent = useCallback((e, click) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let found = null;
    for (const p of positions) { if (Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2) < 16) { found = p.id; break; } }
    if (click && found) onSelect(found); else if (!click) setHovered(found);
  }, [positions, onSelect]);

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      <canvas ref={canvasRef} style={{ width: dims.w, height: dims.h, cursor: hovered ? "pointer" : "crosshair" }}
        onClick={e => handleEvent(e, true)} onMouseMove={e => handleEvent(e, false)} onMouseLeave={() => setHovered(null)} />
    </div>
  );
};

// ─── AI Analysis ─────────────────────────────────────────────────────
const AIPanel = ({ scored }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(null); // "live" | "demo"

  const runAnalysis = async () => {
    setLoading(true); setError(null);
    try {
      // Try live API first via serverless proxy
      const sorted = [...scored].sort((a, b) => b.score - a.score);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: sorted }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        setMode("live");
      } else {
        throw new Error("API unavailable");
      }
    } catch {
      // Fallback to demo mode
      setAnalysis(demoAnalysis(scored));
      setMode("demo");
    }
    setLoading(false);
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
      <button onClick={() => setAnalysis(null)} style={{ padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>↻ Re-analyze</button>
    </div>
  );
};

// ─── Feature Form ────────────────────────────────────────────────────
const Form = ({ onAdd, onCancel }) => {
  const [name, setName] = useState(""); const [desc, setDesc] = useState("");
  const [r, setR] = useState(50); const [i, setI] = useState(50); const [c, setC] = useState(50); const [e, setE] = useState(50);
  const preview = useMemo(() => rice({ reach: r, impact: i, confidence: c, effort: e }), [r, i, c, e]);
  const submit = () => { if (!name.trim()) return; onAdd({ id: `f-${Date.now()}`, name: name.trim(), description: desc.trim(), reach: r, impact: i, confidence: c, effort: e }); };

  const inputStyle = { padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, color: C.text, outline: "none", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={{ padding: 20, border: `1px solid ${C.borderActive}`, borderRadius: 12, background: C.surface }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input value={name} onChange={ev => setName(ev.target.value)} placeholder="Feature name" style={{ ...inputStyle, fontSize: 14 }} onFocus={ev => ev.target.style.borderColor = C.accent} onBlur={ev => ev.target.style.borderColor = C.border} />
        <textarea value={desc} onChange={ev => setDesc(ev.target.value)} placeholder="Brief description (optional)" rows={2} style={{ ...inputStyle, fontSize: 13, resize: "vertical" }} onFocus={ev => ev.target.style.borderColor = C.accent} onBlur={ev => ev.target.style.borderColor = C.border} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Slider label="Reach" value={r} onChange={setR} color={C.accent} icon="📡" />
          <Slider label="Impact" value={i} onChange={setI} color={C.blue} icon="💥" />
          <Slider label="Confidence" value={c} onChange={setC} color={C.purple} icon="🎯" />
          <Slider label="Effort" value={e} onChange={setE} color={C.warn} icon="⏱️" />
        </div>
        <div style={{ padding: 12, borderRadius: 8, background: C.accentGlow, border: `1px solid ${C.accent}20`, textAlign: "center" }}>
          <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>RICE SCORE</span>
          <p style={{ fontSize: 28, fontWeight: 800, color: C.accent, margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>{preview.toLocaleString()}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={submit} disabled={!name.trim()} style={{ flex: 1, padding: "10px 16px", border: "none", borderRadius: 8, background: name.trim() ? C.accent : C.border, color: name.trim() ? C.bg : C.textDim, fontSize: 13, fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed", fontFamily: "'JetBrains Mono', monospace" }}>Add Feature</button>
          <button onClick={onCancel} style={{ padding: "10px 16px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─── Feature Card ────────────────────────────────────────────────────
const Card = ({ feature, rank, isSelected, onClick, onDelete, maxScore }) => {
  const { score } = feature;
  const tier = getTier(feature);

  return (
    <div onClick={onClick} style={{ padding: 14, border: `1px solid ${isSelected ? tier.color + "50" : C.border}`, borderRadius: 10, background: isSelected ? tier.color + "08" : C.surface, cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = C.borderActive; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = C.border; }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>#{rank}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{feature.name}</span>
          </div>
          {feature.description && <p style={{ fontSize: 11, color: C.textMuted, margin: "0 0 8px", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{feature.description}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ScoreBar value={feature.reach} color={C.accent} label="R" />
            <ScoreBar value={feature.impact} color={C.blue} label="I" />
            <ScoreBar value={feature.confidence} color={C.purple} label="C" />
            <ScoreBar value={feature.effort} color={C.warn} label="E" />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <Pill color={tier.color} dimColor={tier.color + "20"}>{tier.label}</Pill>
          <span style={{ fontSize: 18, fontWeight: 800, color: tier.color, fontFamily: "'JetBrains Mono', monospace" }}>{score.toLocaleString()}</span>
          <button onClick={e => { e.stopPropagation(); onDelete(feature.id); }} style={{ marginTop: 4, padding: "3px 8px", border: `1px solid ${C.danger}20`, borderRadius: 6, background: "transparent", color: C.danger + "80", fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.background = C.dangerDim; e.target.style.color = C.danger; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.danger + "80"; }}>✕ Remove</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────────────
export default function App() {
  const [features, setFeatures] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isMobile = useMedia("(max-width: 800px)");
  const { scored, sorted, maxScore } = useScored(features);

  useEffect(() => { const saved = load(); setFeatures(saved && saved.length > 0 ? saved : SAMPLES); setLoaded(true); }, []);
  useEffect(() => { if (loaded) save(features); }, [features, loaded]);

  const addFeature = (f) => { setFeatures(prev => [...prev, f]); setShowForm(false); };
  const deleteFeature = (id) => { setFeatures(prev => prev.filter(f => f.id !== id)); if (selectedId === id) setSelectedId(null); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <header style={{ padding: "24px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${C.accent}30` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", background: `linear-gradient(135deg, ${C.text}, ${C.textMuted})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Prioritize</h1>
            <p style={{ fontSize: 11, color: C.textMuted, margin: 0, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>AI-POWERED RICE FRAMEWORK</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Pill color={C.accent} dimColor={C.accentDim} small>{features.length} FEATURES</Pill>
          <Pill color={C.blue} dimColor={C.blueDim} small>RICE</Pill>
        </div>
      </header>

      <div style={{ display: isMobile ? "flex" : "grid", flexDirection: isMobile ? "column" : undefined, gridTemplateColumns: isMobile ? undefined : "minmax(300px, 380px) 1fr", minHeight: "calc(100vh - 85px)" }}>
        <div style={{ borderRight: isMobile ? "none" : `1px solid ${C.border}`, borderBottom: isMobile ? `1px solid ${C.border}` : "none", padding: 20, overflowY: "auto", maxHeight: isMobile ? "none" : "calc(100vh - 85px)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowForm(true)} style={{ flex: 1, padding: "10px 16px", border: `1px dashed ${C.accent}50`, borderRadius: 8, background: C.accentGlow, color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
              onMouseEnter={e => e.target.style.background = C.accentDim} onMouseLeave={e => e.target.style.background = C.accentGlow}>+ Add Feature</button>
            <button onClick={() => { setFeatures(SAMPLES); setSelectedId(null); }} style={{ padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }} title="Load sample features">↻ Samples</button>
          </div>
          {showForm && <Form onAdd={addFeature} onCancel={() => setShowForm(false)} />}
          {sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 13, color: C.textMuted }}>No features yet. Add your first feature or load samples.</p></div>
          ) : sorted.map((f, i) => (
            <Card key={f.id} feature={f} rank={i + 1} isSelected={f.id === selectedId} onClick={() => setSelectedId(f.id === selectedId ? null : f.id)} onDelete={deleteFeature} maxScore={maxScore} />
          ))}
        </div>

        <div style={{ padding: 24, overflowY: "auto", maxHeight: isMobile ? "none" : "calc(100vh - 85px)", display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Priority Matrix</h2>
              <Pill color={C.textMuted} dimColor={C.border} small>EFFORT vs IMPACT</Pill>
            </div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, background: C.surface, padding: "16px 12px 8px", overflow: "hidden" }}>
              {scored.length > 0 ? <Matrix scored={scored} maxScore={maxScore} selectedId={selectedId} onSelect={setSelectedId} /> : <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: 13, color: C.textDim }}>Add features to see the priority matrix</p></div>}
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>AI Strategy Advisor</h2>
              <Pill color={C.purple} dimColor={C.purpleDim} small>CLAUDE</Pill>
            </div>
            <AIPanel scored={scored} />
          </div>
          <div style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, display: "flex", flexWrap: "wrap", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
            <div>
              <span style={{ fontSize: 9, color: C.textDim, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>RICE FORMULA</span>
              <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>(Reach × Impact × Confidence) ÷ Effort</p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginLeft: isMobile ? 0 : "auto" }}>
              {[{ l: "QUICK WIN", c: C.accent }, { l: "STRATEGIC", c: C.blue }, { l: "LOW HANG", c: C.warn }, { l: "MONEY PIT", c: C.danger }].map(t => (
                <div key={t.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.c }} />
                  <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{t.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
