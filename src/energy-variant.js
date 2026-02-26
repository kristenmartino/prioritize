// ─── NextEra Energy Variant ──────────────────────────────────────────
// Drop-in replacement for SAMPLES, QUADRANT_LABELS, and AI prompt
// in App.jsx to create an energy-sector focused demo.
//
// Swap these constants and the prompt in api/analyze.js (or the
// demoAnalysis function) to customize for energy interviews.
// ─────────────────────────────────────────────────────────────────────

// Replace SAMPLES in App.jsx
export const ENERGY_SAMPLES = [
  {
    id: "e1",
    name: "Grid Modernization Dashboard",
    description: "Real-time visualization of grid performance, outage tracking, and predictive maintenance alerts across FPL service territory",
    reach: 90, impact: 85, confidence: 80, effort: 75,
  },
  {
    id: "e2",
    name: "Solar Site Selection AI",
    description: "ML model scoring potential solar farm locations by irradiance, land cost, grid proximity, permitting complexity, and environmental constraints",
    reach: 60, impact: 95, confidence: 55, effort: 85,
  },
  {
    id: "e3",
    name: "Customer Rate Optimization",
    description: "Personalized rate plan recommendations for residential customers based on usage patterns, EV ownership, and time-of-use pricing elasticity",
    reach: 95, impact: 70, confidence: 85, effort: 40,
  },
  {
    id: "e4",
    name: "Storm Hardening Prioritizer",
    description: "Risk-ranked infrastructure hardening backlog using hurricane probability models, asset age, customer density, and restoration cost data",
    reach: 75, impact: 90, confidence: 70, effort: 65,
  },
  {
    id: "e5",
    name: "Battery Storage Dispatch Optimizer",
    description: "Real-time dispatch optimization for utility-scale battery assets balancing grid stability, peak shaving, and wholesale market arbitrage",
    reach: 40, impact: 80, confidence: 45, effort: 90,
  },
];

// Replace QUADRANT_LABELS in App.jsx
export const ENERGY_QUADRANTS = [
  { label: "Quick Deploys", sub: "High Impact · Low Effort", x: 0.25, y: 0.82, color: "#4ADE80" },
  { label: "Capex Investments", sub: "High Impact · High Effort", x: 0.75, y: 0.82, color: "#60A5FA" },
  { label: "Pilot Candidates", sub: "Low Impact · Low Effort", x: 0.25, y: 0.18, color: "#FBBF24" },
  { label: "Regulatory Risks", sub: "Low Impact · High Effort", x: 0.75, y: 0.18, color: "#F87171" },
];

// Replace the AI prompt in api/analyze.js or the demoAnalysis function
export const ENERGY_AI_PROMPT = (features) => `You are a senior energy strategy consultant advising a utility company on technology and infrastructure prioritization. Analyze this initiative backlog using the RICE framework and provide actionable recommendations.

Context: This is a major US utility company focused on clean energy transition, grid modernization, and operational efficiency. Prioritization must balance customer impact, regulatory compliance, grid reliability, and capital efficiency.

Initiatives (sorted by RICE score):
${features.map((f, i) => `${i + 1}. "${f.name}" — Reach:${f.reach} Impact:${f.impact} Confidence:${f.confidence} Effort:${f.effort} → RICE:${f.score}
   Description: ${f.description}`).join("\n")}

Respond ONLY with a JSON object (no markdown, no backticks). Structure:
{
  "summary": "2-sentence executive summary of the initiative backlog health and strategic alignment",
  "topPick": { "name": "initiative name", "reason": "1-sentence why to prioritize first, referencing energy industry factors" },
  "riskFlag": { "name": "initiative name", "reason": "1-sentence risk concern including regulatory or operational factors" },
  "quickWin": { "name": "initiative name", "reason": "1-sentence why this delivers fast value to ratepayers or grid operations" },
  "sprintPlan": ["initiative 1 name", "initiative 2 name", "initiative 3 name"],
  "insight": "1 non-obvious strategic observation about this backlog, considering clean energy transition, grid reliability, or regulatory positioning"
}`;

// Demo fallback for energy variant
export const energyDemoAnalysis = (scored) => {
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const quickWin = sorted.find(f => f.effort <= 50 && f.impact >= 50) || sorted[1];
  const risky = sorted.find(f => f.confidence <= 60) || lowest;

  return {
    summary: `This initiative backlog spans ${sorted.length} projects with RICE scores from ${lowest.score.toLocaleString()} to ${top.score.toLocaleString()}. The portfolio reflects a balanced approach to grid modernization and clean energy transition, though several high-impact items carry confidence gaps that warrant pilot validation before full capital commitment.`,
    topPick: {
      name: top.name,
      reason: `Highest strategic value (RICE: ${top.score.toLocaleString()}) with strong reach across the service territory — positions the utility ahead of regulatory timelines while delivering measurable operational improvements.`,
    },
    quickWin: {
      name: quickWin.name,
      reason: `Moderate effort (${quickWin.effort}/100) with immediate customer-facing impact — generates positive regulatory signals and ratepayer satisfaction that builds political capital for larger capital programs.`,
    },
    riskFlag: {
      name: risky.name,
      reason: `Confidence score of ${risky.confidence}/100 suggests technology maturity or regulatory clarity concerns. Recommend a bounded pilot program before committing full capital allocation to de-risk the investment thesis.`,
    },
    sprintPlan: sorted.slice(0, Math.min(3, sorted.length)).map(f => f.name),
    insight: `The highest-effort initiatives in this backlog are also the ones with the lowest confidence scores, suggesting a correlation between project complexity and uncertainty. A staged gate approach — small pilot, measured results, then scale — would reduce total portfolio risk while preserving optionality on the most transformative bets.`,
  };
};
