import { LC } from "./landingTheme";

const capabilities = [
  { title: "Structure judgment", desc: "Start with RICE and other frameworks.", color: LC.green },
  { title: "See tradeoffs clearly", desc: "Compare candidates in ranked lists and Tradeoff Maps.", color: LC.blue },
  { title: "Use AI with context", desc: "Generate recommendations grounded in product strategy.", color: LC.violet },
  { title: "Preserve rationale", desc: "Turn prioritization into a decision record.", color: LC.gold },
];

export const LandingCapabilities = () => (
  <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
    <h2 style={{ fontSize: 28, fontWeight: 700, color: LC.text, textAlign: "center", margin: "0 0 40px", letterSpacing: "-0.02em" }}>
      Tarazu gives product teams a decision layer.
    </h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
      {capabilities.map(c => (
        <div key={c.title} style={{ padding: 24, background: LC.surface, border: `1px solid ${LC.border}`, borderRadius: 12, borderTop: `3px solid ${c.color}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: c.color, margin: "0 0 8px" }}>{c.title}</h3>
          <p style={{ fontSize: 13, color: LC.textMuted, margin: 0, lineHeight: 1.6 }}>{c.desc}</p>
        </div>
      ))}
    </div>
  </section>
);
