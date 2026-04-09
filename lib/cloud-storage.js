const json = (r) => r.ok ? r.json() : r.json().then(e => { throw new Error(e.error || "Request failed"); });

export async function fetchWorkspaces() {
  return json(await fetch("/api/workspaces"));
}

export async function createWorkspace(name) {
  return json(await fetch("/api/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }));
}

export async function renameWorkspaceApi(id, name) {
  return json(await fetch(`/api/workspaces/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }));
}

export async function deleteWorkspaceApi(id) {
  return json(await fetch(`/api/workspaces/${id}`, { method: "DELETE" }));
}

export async function fetchFeatures(wsId) {
  return json(await fetch(`/api/workspaces/${wsId}/features`));
}

export async function upsertFeature(wsId, feature) {
  return json(await fetch(`/api/workspaces/${wsId}/features`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feature),
  }));
}

export async function deleteFeatureApi(wsId, featureId) {
  return json(await fetch(`/api/workspaces/${wsId}/features/${featureId}`, { method: "DELETE" }));
}

export async function updateFeatureOrder(wsId, orderedIds) {
  return json(await fetch(`/api/workspaces/${wsId}/features`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedIds }),
  }));
}

export async function fetchProductContext(wsId) {
  return json(await fetch(`/api/workspaces/${wsId}/context`));
}

export async function saveProductContext(wsId, ctx) {
  return json(await fetch(`/api/workspaces/${wsId}/context`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ctx),
  }));
}

// ─── Feedback API ────────────────────────────────────────────────────

export async function postScoreEvents(wsId, events) {
  return json(await fetch(`/api/workspaces/${wsId}/feedback/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events }),
  }));
}

export async function resolveScoreEvents(wsId, featureId, finalScores) {
  return json(await fetch(`/api/workspaces/${wsId}/feedback/scores/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ featureId, finalScores }),
  }));
}

export async function postAnalysisEvent(wsId, event) {
  return json(await fetch(`/api/workspaces/${wsId}/feedback/analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }));
}

export async function updateAnalysisEvent(wsId, eventId, updates) {
  return json(await fetch(`/api/workspaces/${wsId}/feedback/analysis/${eventId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  }));
}

export async function fetchFeedbackSummary(wsId) {
  return json(await fetch(`/api/workspaces/${wsId}/feedback/summary`));
}

export async function fetchFeedbackContext(wsId) {
  return json(await fetch(`/api/workspaces/${wsId}/feedback/context`));
}

// ─── Version Control API ────────────────────────────────────────────

export async function fetchFeatureHistory(wsId, featureId, page = 1, limit = 20) {
  return json(await fetch(`/api/workspaces/${wsId}/features/${featureId}/history?page=${page}&limit=${limit}`));
}

export async function revertFeature(wsId, featureId, revisionNumber) {
  return json(await fetch(`/api/workspaces/${wsId}/features/${featureId}/revert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ revision_number: revisionNumber }),
  }));
}

// ─── Decisions API ──────────────────────────────────────────────────

export async function fetchDecisions(wsId, status) {
  const qs = status ? `?status=${status}` : "";
  return json(await fetch(`/api/workspaces/${wsId}/decisions${qs}`));
}

export async function createDecision(wsId, decision) {
  return json(await fetch(`/api/workspaces/${wsId}/decisions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(decision),
  }));
}

export async function updateDecision(wsId, decisionId, updates) {
  return json(await fetch(`/api/workspaces/${wsId}/decisions/${decisionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  }));
}

export async function deleteDecisionApi(wsId, decisionId) {
  return json(await fetch(`/api/workspaces/${wsId}/decisions/${decisionId}`, {
    method: "DELETE",
  }));
}

// ─── Signals API ────────────────────────────────────────────────────

export async function fetchSignals(wsId, filters) {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.theme) params.set("theme", filters.theme);
  if (filters?.candidate_id) params.set("candidate_id", filters.candidate_id);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return json(await fetch(`/api/workspaces/${wsId}/signals${qs}`));
}

export async function createSignal(wsId, signal) {
  return json(await fetch(`/api/workspaces/${wsId}/signals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signal),
  }));
}

export async function updateSignal(wsId, signalId, updates) {
  return json(await fetch(`/api/workspaces/${wsId}/signals/${signalId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  }));
}

export async function deleteSignalApi(wsId, signalId) {
  return json(await fetch(`/api/workspaces/${wsId}/signals/${signalId}`, {
    method: "DELETE",
  }));
}

export async function importSignals(wsId, signals) {
  return json(await fetch(`/api/workspaces/${wsId}/signals/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signals }),
  }));
}

// ─── Scenarios API ──────────────────────────────────────────────────

export async function fetchScenarios(wsId) {
  return json(await fetch(`/api/workspaces/${wsId}/scenarios`));
}

export async function createScenario(wsId, scenario) {
  return json(await fetch(`/api/workspaces/${wsId}/scenarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scenario),
  }));
}

export async function updateScenario(wsId, scenarioId, updates) {
  return json(await fetch(`/api/workspaces/${wsId}/scenarios/${scenarioId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  }));
}

export async function deleteScenarioApi(wsId, scenarioId) {
  return json(await fetch(`/api/workspaces/${wsId}/scenarios/${scenarioId}`, {
    method: "DELETE",
  }));
}

// ─── Sync ───────────────────────────────────────────────────────────

export async function syncFeatures(wsId, features, manualOrder) {
  // Bulk sync: delete removed, upsert all current, update order
  const { features: remote } = await fetchFeatures(wsId);
  const localIds = new Set(features.map(f => f.id));
  const remoteIds = new Set(remote.map(f => f.id));

  // Delete features removed locally
  for (const rf of remote) {
    if (!localIds.has(rf.id)) {
      await deleteFeatureApi(wsId, rf.id);
    }
  }

  // Upsert all local features
  const idMap = {};
  for (const f of features) {
    const result = await upsertFeature(wsId, f);
    if (result.id && result.id !== f.id) {
      idMap[f.id] = result.id;
    }
  }

  // Update order if we have manual order
  if (manualOrder.length > 0) {
    const mappedOrder = manualOrder.map(id => idMap[id] || id);
    await updateFeatureOrder(wsId, mappedOrder);
  }

  return idMap;
}
