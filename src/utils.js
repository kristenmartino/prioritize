import { C } from "./theme";

export const rice = (f) => Math.round((f.reach * f.impact * f.confidence) / Math.max(f.effort, 1));
export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

export const getTier = (f) => {
  if (f.effort <= 50 && f.impact > 50) return { color: C.accent, label: "QUICK WIN" };
  if (f.effort > 50 && f.impact > 50) return { color: C.blue, label: "STRATEGIC" };
  if (f.effort <= 50 && f.impact <= 50) return { color: C.warn, label: "LOW HANG" };
  return { color: C.danger, label: "MONEY PIT" };
};

const csvSafe = (str) => { const s = (str || "").replace(/"/g, '""'); return /^[=+\-@\t\r]/.test(s) ? `"'${s}"` : `"${s}"`; };

export const exportCSV = (ordered, wsName) => {
  const header = "Rank,Name,Description,Reach,Impact,Confidence,Effort,RICE Score,Tier\n";
  const rows = ordered.map((f, i) => `${i + 1},${csvSafe(f.name)},${csvSafe(f.description)},${f.reach},${f.impact},${f.confidence},${f.effort},${f.score},${csvSafe(getTier(f).label)}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${(wsName || "backlog").replace(/\s+/g, "-").toLowerCase()}.csv`; a.click();
  URL.revokeObjectURL(url);
};
