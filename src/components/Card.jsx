import { C } from "../theme";
import { getTier } from "../utils";
import { Pill } from "./Pill";
import { ScoreBar } from "./ScoreBar";

export const Card = ({ feature, rank, isSelected, onClick, onDelete, onEdit, maxScore, draggable: canDrag, onDragStart, onDragOver, onDrop, isDragging }) => {
  const { score } = feature;
  const tier = getTier(feature);

  return (
    <div onClick={onClick} draggable={canDrag} onDragStart={e => { e.dataTransfer.effectAllowed = "move"; onDragStart?.(feature.id); }} onDragOver={e => { e.preventDefault(); onDragOver?.(e); }} onDrop={() => onDrop?.(feature.id)} style={{ padding: 14, border: `1px solid ${isSelected ? tier.color + "50" : C.border}`, borderRadius: 10, background: isSelected ? tier.color + "08" : C.surface, cursor: canDrag ? "grab" : "pointer", transition: "all 0.2s", opacity: isDragging ? 0.4 : 1 }}
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
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={e => { e.stopPropagation(); onEdit(feature); }} style={{ padding: "3px 8px", border: `1px solid ${C.blue}20`, borderRadius: 6, background: "transparent", color: C.blue + "80", fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.background = C.blueDim; e.target.style.color = C.blue; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.blue + "80"; }}>✎ Edit</button>
            <button onClick={e => { e.stopPropagation(); onDelete(feature.id); }} style={{ padding: "3px 8px", border: `1px solid ${C.danger}20`, borderRadius: 6, background: "transparent", color: C.danger + "80", fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.background = C.dangerDim; e.target.style.color = C.danger; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.danger + "80"; }}>✕ Remove</button>
          </div>
        </div>
      </div>
    </div>
  );
};
