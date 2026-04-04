// localStorage adapter for guest-mode feedback events.
// Mirrors the same event shapes as the Supabase tables.

const scoreKey = (wsId) => `prioritize-ws-${wsId}-score-events`;
const analysisKey = (wsId) => `prioritize-ws-${wsId}-analysis-events`;

export function loadScoreEvents(wsId) {
  try {
    const d = localStorage.getItem(scoreKey(wsId));
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

export function saveScoreEvent(wsId, event) {
  const events = loadScoreEvents(wsId);
  events.push({ ...event, id: event.id || `se-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, created_at: new Date().toISOString() });
  try { localStorage.setItem(scoreKey(wsId), JSON.stringify(events)); } catch {}
  return events;
}

export function updateScoreEvent(wsId, eventId, updates) {
  const events = loadScoreEvents(wsId);
  const idx = events.findIndex(e => e.id === eventId);
  if (idx !== -1) events[idx] = { ...events[idx], ...updates };
  try { localStorage.setItem(scoreKey(wsId), JSON.stringify(events)); } catch {}
  return events;
}

export function resolveScoreEvents(wsId, featureId, finalScores) {
  const events = loadScoreEvents(wsId);
  let changed = false;
  for (const e of events) {
    if (e.feature_id === featureId && e.outcome === "pending") {
      const finalVal = finalScores[e.dimension];
      if (finalVal != null) {
        e.final_score = finalVal;
        const drift = Math.abs(finalVal - e.ai_score);
        e.outcome = drift <= 5 ? "accepted" : "adjusted";
        changed = true;
      }
    }
  }
  if (changed) {
    try { localStorage.setItem(scoreKey(wsId), JSON.stringify(events)); } catch {}
  }
  return events;
}

export function loadAnalysisEvents(wsId) {
  try {
    const d = localStorage.getItem(analysisKey(wsId));
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

export function saveAnalysisEvent(wsId, event) {
  const events = loadAnalysisEvents(wsId);
  const newEvent = { ...event, id: event.id || `ae-${Date.now()}`, created_at: new Date().toISOString() };
  events.push(newEvent);
  try { localStorage.setItem(analysisKey(wsId), JSON.stringify(events)); } catch {}
  return newEvent;
}

export function updateAnalysisEvent(wsId, eventId, updates) {
  const events = loadAnalysisEvents(wsId);
  const idx = events.findIndex(e => e.id === eventId);
  if (idx !== -1) events[idx] = { ...events[idx], ...updates };
  try { localStorage.setItem(analysisKey(wsId), JSON.stringify(events)); } catch {}
}
