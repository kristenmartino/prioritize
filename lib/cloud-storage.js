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
