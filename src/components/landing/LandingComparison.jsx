import { LC } from "./landingTheme";

const rows = [
  "Framework-based scoring",
  "Visual tradeoff analysis",
  "Explainable AI recommendations",
  "Strategy context",
  "Decision history",
];
const cols = ["Tarazu", "Spreadsheets", "Roadmap tools", "Generic AI"];
const checks = [
  [true, false, false, false],
  [true, false, true, false],
  [true, false, false, true],
  [true, false, false, false],
  [true, false, false, false],
];

export const LandingComparison = () => (
  <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
    <h2 style={{ fontSize: 28, fontWeight: 700, color: LC.text, textAlign: "center", margin: "0 0 40px", letterSpacing: "-0.02em" }}>
      Built for prioritization, not just tracking.
    </h2>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: LC.textDim, fontFamily: "'JetBrains Mono', monospace", borderBottom: `1px solid ${LC.border}` }} />
            {cols.map((col, i) => (
              <th key={col} style={{
                padding: "12px 16px", textAlign: "center", fontSize: 11, fontWeight: 600,
                color: i === 0 ? LC.blue : LC.textDim, fontFamily: "'JetBrains Mono', monospace",
                borderBottom: `1px solid ${LC.border}`, background: i === 0 ? LC.blue + "08" : "transparent",
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row}>
              <td style={{ padding: "12px 16px", fontSize: 13, color: LC.text, borderBottom: `1px solid ${LC.border}` }}>{row}</td>
              {checks[ri].map((ok, ci) => (
                <td key={ci} style={{
                  padding: "12px 16px", textAlign: "center", borderBottom: `1px solid ${LC.border}`,
                  background: ci === 0 ? LC.blue + "08" : "transparent",
                }}>
                  {ok ? <span style={{ color: LC.green, fontSize: 16 }}>&#10003;</span> : <span style={{ color: LC.textDim, fontSize: 14 }}>&#8212;</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
