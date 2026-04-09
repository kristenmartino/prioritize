import { C } from "../theme";

const selectStyle = {
  padding: "5px 8px", border: `1px solid ${C.border}`, borderRadius: 6,
  background: C.bg, color: C.text, fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
  outline: "none", cursor: "pointer",
};

export const MapControls = ({ colorBy, sizeBy, labelMode, onColorByChange, onSizeByChange, onLabelModeChange }) => (
  <div data-no-print style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0", flexWrap: "wrap" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <label style={{ fontSize: 9, fontWeight: 600, color: C.textDim, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>COLOR</label>
      <select value={colorBy} onChange={e => onColorByChange(e.target.value)} style={selectStyle}>
        <option value="tier">Tier</option>
        <option value="confidence">Confidence</option>
      </select>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <label style={{ fontSize: 9, fontWeight: 600, color: C.textDim, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>SIZE</label>
      <select value={sizeBy} onChange={e => onSizeByChange(e.target.value)} style={selectStyle}>
        <option value="uniform">Uniform</option>
        <option value="reach">Reach</option>
        <option value="score">Score</option>
      </select>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <label style={{ fontSize: 9, fontWeight: 600, color: C.textDim, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>LABELS</label>
      <select value={labelMode} onChange={e => onLabelModeChange(e.target.value)} style={selectStyle}>
        <option value="hover">Hover</option>
        <option value="always">Always</option>
        <option value="off">Off</option>
      </select>
    </div>
  </div>
);
