import { useState, useMemo } from "react";
import { C } from "../theme";
import { rice } from "../utils";
import { Slider } from "./Slider";

export const Form = ({ onAdd, onCancel, editFeature }) => {
  const [name, setName] = useState(editFeature?.name || ""); const [desc, setDesc] = useState(editFeature?.description || "");
  const [r, setR] = useState(editFeature?.reach ?? 50); const [i, setI] = useState(editFeature?.impact ?? 50); const [c, setC] = useState(editFeature?.confidence ?? 50); const [e, setE] = useState(editFeature?.effort ?? 50);
  const preview = useMemo(() => rice({ reach: r, impact: i, confidence: c, effort: e }), [r, i, c, e]);
  const submit = () => { if (!name.trim()) return; onAdd({ id: editFeature?.id || `f-${Date.now()}`, name: name.trim(), description: desc.trim(), reach: r, impact: i, confidence: c, effort: e }); };

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
          <button onClick={submit} disabled={!name.trim()} style={{ flex: 1, padding: "10px 16px", border: "none", borderRadius: 8, background: name.trim() ? C.accent : C.border, color: name.trim() ? C.bg : C.textDim, fontSize: 13, fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed", fontFamily: "'JetBrains Mono', monospace" }}>{editFeature ? "Save Changes" : "Add Feature"}</button>
          <button onClick={onCancel} style={{ padding: "10px 16px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
