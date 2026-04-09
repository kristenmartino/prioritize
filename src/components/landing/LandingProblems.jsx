import { LC } from "./landingTheme";

const problems = [
  { title: "Inconsistent scoring", desc: "Different stakeholders use different logic." },
  { title: "Scattered context", desc: "Research, feedback, and rationale live in separate places." },
  { title: "Weak decision memory", desc: "Teams remember what they chose, but not why." },
];

export const LandingProblems = () => (
  <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
    <h2 style={{ fontSize: 28, fontWeight: 700, color: LC.text, textAlign: "center", margin: "0 0 12px", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
      Most product prioritization still happens in spreadsheets, meetings, and opinion loops.
    </h2>
    <p style={{ fontSize: 15, color: LC.textMuted, textAlign: "center", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.6 }}>
      Teams score inconsistently, context gets lost, and decisions are hard to explain later. Tarazu gives product teams a clearer system for weighing tradeoffs.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
      {problems.map(p => (
        <div key={p.title} style={{ padding: 24, background: LC.surface, border: `1px solid ${LC.border}`, borderRadius: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: LC.coral, margin: "0 0 8px" }}>{p.title}</h3>
          <p style={{ fontSize: 13, color: LC.textMuted, margin: 0, lineHeight: 1.6 }}>{p.desc}</p>
        </div>
      ))}
    </div>
  </section>
);
