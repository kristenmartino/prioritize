import { describe, it, expect } from "vitest";
import { classifyOutcome, buildScoreCalibration, buildAnalysisContext, computeSummaryMetrics } from "./feedback-context";

describe("classifyOutcome", () => {
  it("returns 'pending' when finalScore is null", () => {
    expect(classifyOutcome(50, null)).toBe("pending");
  });

  it("returns 'pending' when finalScore is undefined", () => {
    expect(classifyOutcome(50, undefined)).toBe("pending");
  });

  it("returns 'accepted' when drift is within threshold", () => {
    expect(classifyOutcome(50, 53)).toBe("accepted");
    expect(classifyOutcome(50, 50)).toBe("accepted");
    expect(classifyOutcome(50, 45)).toBe("accepted");
  });

  it("returns 'accepted' when drift is exactly 5", () => {
    expect(classifyOutcome(50, 55)).toBe("accepted");
    expect(classifyOutcome(50, 45)).toBe("accepted");
  });

  it("returns 'adjusted' when drift exceeds threshold", () => {
    expect(classifyOutcome(50, 60)).toBe("adjusted");
    expect(classifyOutcome(50, 40)).toBe("adjusted");
  });
});

describe("buildScoreCalibration", () => {
  it("returns empty string with fewer than 3 resolved events", () => {
    const events = [
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "impact", outcome: "adjusted", ai_score: 50, final_score: 70 },
    ];
    expect(buildScoreCalibration(events)).toBe("");
  });

  it("ignores pending events in count", () => {
    const events = [
      { dimension: "reach", outcome: "pending", ai_score: 50, final_score: null },
      { dimension: "reach", outcome: "pending", ai_score: 50, final_score: null },
      { dimension: "reach", outcome: "pending", ai_score: 50, final_score: null },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
    ];
    expect(buildScoreCalibration(events)).toBe("");
  });

  it("returns calibration text with sufficient events", () => {
    const events = [
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "impact", outcome: "accepted", ai_score: 60, final_score: 58 },
      { dimension: "confidence", outcome: "adjusted", ai_score: 70, final_score: 85 },
    ];
    const result = buildScoreCalibration(events);
    expect(result).toContain("Calibration notes");
    expect(result).toContain("3 scores");
    expect(result).toContain("acceptance");
  });

  it("includes underestimating hint when avg drift > 5", () => {
    const events = [
      { dimension: "reach", outcome: "adjusted", ai_score: 30, final_score: 50 },
      { dimension: "reach", outcome: "adjusted", ai_score: 40, final_score: 60 },
      { dimension: "reach", outcome: "adjusted", ai_score: 35, final_score: 55 },
    ];
    const result = buildScoreCalibration(events);
    expect(result).toContain("underestimating reach");
  });

  it("includes overestimating hint when avg drift < -5", () => {
    const events = [
      { dimension: "impact", outcome: "adjusted", ai_score: 80, final_score: 60 },
      { dimension: "impact", outcome: "adjusted", ai_score: 70, final_score: 50 },
      { dimension: "impact", outcome: "adjusted", ai_score: 75, final_score: 55 },
    ];
    const result = buildScoreCalibration(events);
    expect(result).toContain("overestimating impact");
  });
});

describe("buildAnalysisContext", () => {
  it("returns empty string with fewer than 2 valid events", () => {
    const events = [{ error: false, thumbs_up: true }];
    expect(buildAnalysisContext(events)).toBe("");
  });

  it("excludes error events from count", () => {
    const events = [
      { error: true },
      { error: true },
      { error: false, thumbs_up: null },
    ];
    expect(buildAnalysisContext(events)).toBe("");
  });

  it("returns context text with sufficient events", () => {
    const events = [
      { error: false, thumbs_up: true },
      { error: false, thumbs_up: false },
      { error: false, thumbs_up: null },
    ];
    const result = buildAnalysisContext(events);
    expect(result).toContain("3 analyses run");
    expect(result).toContain("1 positive");
    expect(result).toContain("1 negative");
  });
});

describe("computeSummaryMetrics", () => {
  it("returns zeroed metrics for empty arrays", () => {
    const result = computeSummaryMetrics([], []);
    expect(result.scores.total).toBe(0);
    expect(result.scores.accepted).toBe(0);
    expect(result.scores.rate).toBe(0);
    expect(result.analyses.total).toBe(0);
    expect(result.trend).toBe("insufficient_data");
  });

  it("calculates per-dimension stats", () => {
    const scoreEvents = [
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "adjusted", ai_score: 50, final_score: 70 },
      { dimension: "impact", outcome: "accepted", ai_score: 60, final_score: 60 },
    ];
    const result = computeSummaryMetrics(scoreEvents, []);
    expect(result.scores.byDimension.reach.total).toBe(2);
    expect(result.scores.byDimension.reach.accepted).toBe(1);
    expect(result.scores.byDimension.reach.rate).toBe(50);
    expect(result.scores.byDimension.impact.total).toBe(1);
    expect(result.scores.byDimension.impact.accepted).toBe(1);
    expect(result.scores.total).toBe(3);
  });

  it("returns 'insufficient_data' trend with < 6 events", () => {
    const scoreEvents = [
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
    ];
    expect(computeSummaryMetrics(scoreEvents, []).trend).toBe("insufficient_data");
  });

  it("returns 'improving' trend when second half has higher acceptance", () => {
    const scoreEvents = [
      { dimension: "reach", outcome: "adjusted", ai_score: 50, final_score: 70 },
      { dimension: "reach", outcome: "adjusted", ai_score: 50, final_score: 70 },
      { dimension: "reach", outcome: "adjusted", ai_score: 50, final_score: 70 },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
    ];
    expect(computeSummaryMetrics(scoreEvents, []).trend).toBe("improving");
  });

  it("returns 'declining' trend when first half has higher acceptance", () => {
    const scoreEvents = [
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "adjusted", ai_score: 50, final_score: 70 },
      { dimension: "reach", outcome: "adjusted", ai_score: 50, final_score: 70 },
      { dimension: "reach", outcome: "adjusted", ai_score: 50, final_score: 70 },
    ];
    expect(computeSummaryMetrics(scoreEvents, []).trend).toBe("declining");
  });

  it("returns 'stable' trend when rates are within 0.1", () => {
    const scoreEvents = [
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "adjusted", ai_score: 50, final_score: 70 },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
      { dimension: "reach", outcome: "adjusted", ai_score: 50, final_score: 70 },
      { dimension: "reach", outcome: "accepted", ai_score: 50, final_score: 52 },
    ];
    expect(computeSummaryMetrics(scoreEvents, []).trend).toBe("stable");
  });

  it("calculates analysis metrics", () => {
    const analysisEvents = [
      { error: false, thumbs_up: true },
      { error: false, thumbs_up: false },
      { error: true, thumbs_up: null },
      { error: false, thumbs_up: null },
    ];
    const result = computeSummaryMetrics([], analysisEvents);
    expect(result.analyses.total).toBe(3);
    expect(result.analyses.errors).toBe(1);
    expect(result.analyses.thumbsUp).toBe(1);
    expect(result.analyses.thumbsDown).toBe(1);
    expect(result.analyses.rated).toBe(2);
  });
});
