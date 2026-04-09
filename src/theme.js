export const C = {
  bg: "#0E1116", surface: "#141922", surfaceAlt: "#1B2230",
  border: "#273142", borderActive: "#2A3342",
  text: "#E9EEF5", textMuted: "#8A96A8", textDim: "#5B6677",
  accent: "#6FBE8E", accentDim: "#6FBE8E30", accentGlow: "#6FBE8E18",
  danger: "#DF726A", dangerDim: "#DF726A20",
  warn: "#D4A24C", warnDim: "#D4A24C20",
  blue: "#5E8CFF", blueDim: "#5E8CFF20",
  purple: "#8A7DF4", purpleDim: "#8A7DF41A",
};

export const QUADRANT_LABELS = [
  { label: "Quick Wins", sub: "High Impact · Low Effort", x: 0.25, y: 0.82, color: C.accent },
  { label: "Strategic Bets", sub: "High Impact · High Effort", x: 0.75, y: 0.82, color: C.blue },
  { label: "Fill-ins", sub: "Low Impact · Low Effort", x: 0.25, y: 0.18, color: C.warn },
  { label: "Avoid", sub: "Low Impact · High Effort", x: 0.75, y: 0.18, color: C.danger },
];

export const SAMPLES = [
  { id: "r20", name: "Feature Editing", description: "Modify RICE scores post-creation — users discover scoring errors after initial input and need to adjust without deleting and recreating", reach: 95, impact: 70, confidence: 95, effort: 15 },
  { id: "r21", name: "Export to CSV/PDF", description: "Generate formatted exports for stakeholder distribution — PMs need to share rankings outside the tool in Slack, decks, and emails", reach: 75, impact: 65, confidence: 85, effort: 35 },
  { id: "r23", name: "Drag-and-Drop Reorder", description: "Manual reordering with score override when strategic judgment disagrees with RICE — visual indicator distinguishes overridden items", reach: 60, impact: 75, confidence: 60, effort: 55 },
  { id: "r22", name: "Multiple Workspaces", description: "Named backlog workspaces for PMs managing multiple product areas simultaneously with workspace switching and storage partitioning", reach: 50, impact: 60, confidence: 70, effort: 45 },
  { id: "r24", name: "Jira/Linear Import", description: "CSV or API import from existing project trackers to reduce data entry — field mapping varies across orgs, auth flows add complexity", reach: 40, impact: 55, confidence: 50, effort: 70 },
  { id: "r25", name: "Team Collaboration", description: "Shared workspaces with real-time multi-user access, conflict resolution, and permissions — the killer feature for product teams at scale", reach: 35, impact: 80, confidence: 35, effort: 90 },
  { id: "r26", name: "Historical Trend Tracking", description: "Versioned score history with timeline visualization — enables retrospective analysis of whether priorities actually shifted over time", reach: 30, impact: 50, confidence: 40, effort: 65 },
];
