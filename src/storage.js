export const STORAGE_KEY = "prioritize-features-v1"; // legacy, kept for migration
const WS_INDEX_KEY = "prioritize-workspaces";
const WS_ACTIVE_KEY = "prioritize-active-workspace";

export const save = (features) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(features)); } catch {} };
export const load = () => { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; } };
export const saveWsIndex = (ws) => { try { localStorage.setItem(WS_INDEX_KEY, JSON.stringify(ws)); } catch {} };
export const loadWsIndex = () => { try { const d = localStorage.getItem(WS_INDEX_KEY); return d ? JSON.parse(d) : null; } catch { return null; } };

export const saveWsFeatures = (wsId, features, manualOrder = []) => {
  try { localStorage.setItem(`prioritize-ws-${wsId}`, JSON.stringify({ features, manualOrder })); } catch {}
};

export const loadWsFeatures = (wsId) => {
  try {
    const d = localStorage.getItem(`prioritize-ws-${wsId}`);
    if (!d) return null;
    const parsed = JSON.parse(d);
    // Backwards-compat: old format stored a plain array
    if (Array.isArray(parsed)) return { features: parsed, manualOrder: [] };
    return { features: parsed.features || [], manualOrder: parsed.manualOrder || [] };
  } catch { return null; }
};

export const removeWsFeatures = (wsId) => {
  try { localStorage.removeItem(`prioritize-ws-${wsId}`); } catch {}
};

export const getActiveWsId = () => localStorage.getItem(WS_ACTIVE_KEY);
export const setActiveWsId = (id) => localStorage.setItem(WS_ACTIVE_KEY, id);
