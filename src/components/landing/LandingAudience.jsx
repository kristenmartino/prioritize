import { LC } from "./landingTheme";

const audiences = [
  { title: "Product Managers", desc: "Prioritize with frameworks, not gut feel." },
  { title: "Founders", desc: "Make early-stage tradeoffs with clear rationale." },
  { title: "Product Ops", desc: "Standardize prioritization across multiple teams." },
  { title: "Platform Teams", desc: "Balance internal and external stakeholder needs." },
  { title: "Consultants", desc: "Deliver structured recommendations to clients." },
];

export const LandingAudience = () => (
  <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
    <h2 style={{ fontSize: 28, fontWeight: 700, color: LC.text, textAlign: "center", margin: "0 0 40px", letterSpacing: "-0.02em" }}>
      Designed for product teams that need clearer choices.
    </h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {audiences.map(a => (
        <div key={a.title} style={{ padding: 20, background: LC.surface, border: `1px solid ${LC.border}`, borderRadius: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: LC.text, margin: "0 0 6px" }}>{a.title}</h3>
          <p style={{ fontSize: 12, color: LC.textMuted, margin: 0, lineHeight: 1.5 }}>{a.desc}</p>
        </div>
      ))}
    </div>
  </section>
);
