// Builds prompt-injectable calibration context from feedback events.
// Requires minimum event thresholds to avoid noisy calibration.

const MIN_SCORE_EVENTS = 3;
const MIN_ANALYSIS_EVENTS = 2;
const ACCEPT_THRESHOLD = 5; // within ±5 points counts as "accepted"

export function classifyOutcome(aiScore, finalScore) {
  if (finalScore == null) return "pending";
  const drift = Math.abs(finalScore - aiScore);
  if (drift <= ACCEPT_THRESHOLD) return "accepted";
  return "adjusted";
}

export function buildScoreCalibration(scoreEvents) {
  const resolved = scoreEvents.filter(e => e.outcome !== "pending");
  if (resolved.length < MIN_SCORE_EVENTS) return "";

  const dims = ["reach", "impact", "confidence", "effort"];
  const lines = [];

  for (const dim of dims) {
    const events = resolved.filter(e => e.dimension === dim);
    if (events.length === 0) continue;

    const accepted = events.filter(e => e.outcome === "accepted").length;
    const rate = Math.round((accepted / events.length) * 100);

    const drifts = events
      .filter(e => e.final_score != null)
      .map(e => e.final_score - e.ai_score);
    const avgDrift = drifts.length > 0
      ? Math.round(drifts.reduce((a, b) => a + b, 0) / drifts.length)
      : 0;

    let hint = "";
    if (avgDrift > 5) hint = ` (you may be underestimating ${dim})`;
    else if (avgDrift < -5) hint = ` (you may be overestimating ${dim})`;

    const driftStr = avgDrift >= 0 ? `+${avgDrift}` : `${avgDrift}`;
    lines.push(`- ${dim}: ${rate}% acceptance rate, avg drift ${driftStr}${hint} (${events.length} samples)`);
  }

  if (lines.length === 0) return "";

  const total = resolved.length;
  const totalAccepted = resolved.filter(e => e.outcome === "accepted").length;
  const overallRate = Math.round((totalAccepted / total) * 100);

  return `Calibration notes from this workspace's scoring history (${total} scores, ${overallRate}% overall acceptance):
${lines.join("\n")}

Adjust your scoring tendencies accordingly.`;
}

export function buildAnalysisContext(analysisEvents) {
  const valid = analysisEvents.filter(e => !e.error);
  if (valid.length < MIN_ANALYSIS_EVENTS) return "";

  const withFeedback = valid.filter(e => e.thumbs_up != null);
  const positive = withFeedback.filter(e => e.thumbs_up === true).length;
  const negative = withFeedback.filter(e => e.thumbs_up === false).length;

  const lines = [`- ${valid.length} analyses run for this workspace`];

  if (withFeedback.length > 0) {
    lines.push(`- User feedback: ${positive} positive, ${negative} negative out of ${withFeedback.length} rated`);
  }

  return `Past analysis feedback for this workspace:
${lines.join("\n")}

Consider this track record when calibrating your recommendations.`;
}

export function computeSummaryMetrics(scoreEvents, analysisEvents) {
  const resolved = scoreEvents.filter(e => e.outcome !== "pending");
  const dims = ["reach", "impact", "confidence", "effort"];

  const byDimension = {};
  for (const dim of dims) {
    const events = resolved.filter(e => e.dimension === dim);
    const accepted = events.filter(e => e.outcome === "accepted").length;
    const drifts = events.filter(e => e.final_score != null).map(e => e.final_score - e.ai_score);
    const avgDrift = drifts.length > 0 ? Math.round(drifts.reduce((a, b) => a + b, 0) / drifts.length) : 0;
    byDimension[dim] = {
      total: events.length,
      accepted,
      rate: events.length > 0 ? Math.round((accepted / events.length) * 100) : 0,
      avgDrift,
    };
  }

  const totalScores = resolved.length;
  const totalAccepted = resolved.filter(e => e.outcome === "accepted").length;
  const overallRate = totalScores > 0 ? Math.round((totalAccepted / totalScores) * 100) : 0;

  const validAnalyses = analysisEvents.filter(e => !e.error);
  const withFeedback = validAnalyses.filter(e => e.thumbs_up != null);
  const thumbsUp = withFeedback.filter(e => e.thumbs_up === true).length;

  // Trend: compare first half vs second half acceptance rate
  let trend = "insufficient_data";
  if (resolved.length >= 6) {
    const mid = Math.floor(resolved.length / 2);
    const firstHalf = resolved.slice(0, mid);
    const secondHalf = resolved.slice(mid);
    const firstRate = firstHalf.filter(e => e.outcome === "accepted").length / firstHalf.length;
    const secondRate = secondHalf.filter(e => e.outcome === "accepted").length / secondHalf.length;
    if (secondRate - firstRate > 0.1) trend = "improving";
    else if (firstRate - secondRate > 0.1) trend = "declining";
    else trend = "stable";
  }

  return {
    scores: { byDimension, total: totalScores, accepted: totalAccepted, rate: overallRate },
    analyses: { total: validAnalyses.length, errors: analysisEvents.filter(e => e.error).length, thumbsUp, thumbsDown: withFeedback.length - thumbsUp, rated: withFeedback.length },
    trend,
  };
}
