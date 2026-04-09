import { LC } from "./landingTheme";

const tiers = [
  { name: "Tarazu Core", desc: "Scoring, ranking, tradeoff analysis.", color: LC.green, available: true },
  { name: "Tarazu Signals", desc: "Evidence and feedback.", color: LC.gold, available: false },
  { name: "Tarazu Plan", desc: "Sequencing and scenarios.", color: LC.violet, available: false },
  { name: "Tarazu Align", desc: "Stakeholder-ready decision outputs.", color: LC.blue, available: false },
  { name: "Tarazu Pulse", desc: "Outcome learning.", color: LC.coral, available: false },
];

export const LandingTiers = () => (
  <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
    <h2 style={{ fontSize: 28, fontWeight: 700, color: LC.text, textAlign: "center", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
      Start with RICE. Expand into decision intelligence.
    </h2>
    <p style={{ fontSize: 15, color: LC.textMuted, textAlign: "center", margin: "0 0 40px" }}>A modular system that grows with your team.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {tiers.map(t => (
        <div key={t.name} style={{ padding: 20, background: LC.surface, border: `1px solid ${t.available ? t.color + "40" : LC.border}`, borderRadius: 12, position: "relative" }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: t.color, marginBottom: 12 }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: t.available ? t.color : LC.textMuted, margin: "0 0 6px" }}>{t.name}</h3>
          <p style={{ fontSize: 12, color: LC.textDim, margin: "0 0 12px", lineHeight: 1.5 }}>{t.desc}</p>
          <span style={{ fontSize: 9, fontWeight: 600, color: t.available ? t.color : LC.textDim, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
            {t.available ? "AVAILABLE NOW" : "COMING SOON"}
          </span>
        </div>
      ))}
    </div>
  </section>
);
