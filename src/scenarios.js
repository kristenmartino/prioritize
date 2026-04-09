export const SCENARIO_TEMPLATES = [
  {
    key: "default",
    name: "Standard RICE",
    description: "Default framework ranking with equal weight across all dimensions.",
    weights: { reach: 1.0, impact: 1.0, confidence: 1.0, effort: 1.0 },
  },
  {
    key: "growth",
    name: "Growth Mode",
    description: "Emphasize reach to maximize user exposure and adoption.",
    weights: { reach: 2.5, impact: 1.0, confidence: 0.8, effort: 0.8 },
  },
  {
    key: "fast-wins",
    name: "Fast Wins",
    description: "Prioritize low-effort, high-impact items for quick delivery.",
    weights: { reach: 0.8, impact: 2.0, confidence: 1.0, effort: 2.5 },
  },
  {
    key: "low-risk",
    name: "Low-Risk Next Sprint",
    description: "Favor high-confidence items to reduce delivery risk.",
    weights: { reach: 0.8, impact: 1.0, confidence: 2.5, effort: 1.2 },
  },
  {
    key: "strategic",
    name: "Strategic Bets",
    description: "Emphasize impact regardless of effort for big-swing decisions.",
    weights: { reach: 1.0, impact: 3.0, confidence: 0.5, effort: 0.3 },
  },
];
