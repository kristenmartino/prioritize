import { useMemo } from "react";

const weightedRice = (f, weights) => {
  const numerator = (f.reach * weights.reach) * (f.impact * weights.impact) * (f.confidence * weights.confidence);
  const denominator = Math.max(f.effort * weights.effort, 1);
  return Math.round(numerator / denominator);
};

export const useWeightedScored = (features, weights) => useMemo(() => {
  const scored = features.map(f => ({ ...f, weightedScore: weightedRice(f, weights) }));
  const sorted = [...scored].sort((a, b) => b.weightedScore - a.weightedScore);
  const maxScore = sorted.length > 0 ? sorted[0].weightedScore : 1;
  return { scored, sorted, maxScore };
}, [features, weights]);
