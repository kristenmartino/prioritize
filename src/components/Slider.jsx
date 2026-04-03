import { C } from "../theme";

export const Slider = ({ label, value, onChange, color, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{icon} {label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
    <input type="range" min={1} max={100} value={value} onChange={(e) => onChange(parseInt(e.target.value))} style={{ width: "100%", height: 6, appearance: "none", background: `linear-gradient(to right, ${color} ${value}%, ${C.border} ${value}%)`, borderRadius: 3, outline: "none", cursor: "pointer", accentColor: color }} />
  </div>
);
