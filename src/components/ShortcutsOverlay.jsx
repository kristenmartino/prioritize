import { C } from "../theme";

const shortcuts = [
  { key: "?", desc: "Toggle this help overlay" },
  { key: "N", desc: "Add new candidate (Priorities screen)" },
  { key: "/", desc: "Focus search input (Priorities list)" },
  { key: "Esc", desc: "Close form / deselect candidate" },
  { key: "1", desc: "Go to Home" },
  { key: "2", desc: "Go to Priorities" },
  { key: "3", desc: "Go to Signals" },
  { key: "4", desc: "Go to Decisions" },
  { key: "5", desc: "Go to Scenarios" },
];

export const ShortcutsOverlay = ({ onClose }) => (
  <>
    <div onClick={onClose} style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", zIndex: 999,
    }} />
    <div style={{
      position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
      width: 340, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
      boxShadow: `0 16px 48px ${C.bg}90`, zIndex: 1000, padding: 24,
      animation: "fadeIn 0.15s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Keyboard Shortcuts</span>
        <button onClick={onClose} style={{ padding: "2px 8px", border: `1px solid ${C.border}`, borderRadius: 6, background: "transparent", color: C.textMuted, fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>Esc</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {shortcuts.map(s => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              minWidth: 32, padding: "3px 8px", border: `1px solid ${C.border}`, borderRadius: 5,
              background: C.bg, color: C.text, fontSize: 11, fontWeight: 600, textAlign: "center",
              fontFamily: "'JetBrains Mono', monospace",
            }}>{s.key}</span>
            <span style={{ fontSize: 12, color: C.textMuted }}>{s.desc}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
        Shortcuts are disabled when typing in inputs.
      </div>
    </div>
  </>
);
