import { LC } from "./landingTheme";

const proofs = [
  { icon: "\u2696", label: "Structured frameworks" },
  { icon: "\u25C9", label: "Visual tradeoff analysis" },
  { icon: "\u2727", label: "Explainable AI" },
  { icon: "\u2630", label: "Decision records" },
];

export const LandingProofStrip = () => (
  <section style={{ borderTop: `1px solid ${LC.border}`, borderBottom: `1px solid ${LC.border}`, padding: "24px 24px", maxWidth: 960, margin: "0 auto" }}>
    <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
      {proofs.map(p => (
        <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{p.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: LC.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>{p.label}</span>
        </div>
      ))}
    </div>
  </section>
);
