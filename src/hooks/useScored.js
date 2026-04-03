import { useMemo } from "react";
import { rice } from "../utils";

export const useScored = (features) => useMemo(() => {
  const scored = features.map(f => ({ ...f, score: rice(f) }));
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const maxScore = sorted.length > 0 ? sorted[0].score : 1;
  return { scored, sorted, maxScore };
}, [features]);
