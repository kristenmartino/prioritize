import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { C, SAMPLES } from "./theme";
import { exportCSV, parseCSV, mapCSVToFeatures } from "./utils";
import { load, saveWsIndex, loadWsIndex, saveWsFeatures, loadWsFeatures, removeWsFeatures, saveWsContext, loadWsContext, removeWsContext, getActiveWsId, setActiveWsId as storeActiveWsId, STORAGE_KEY } from "../lib/local-storage";
import * as cloud from "../lib/cloud-storage";
import { useMedia } from "./hooks/useMedia";
import { useScored } from "./hooks/useScored";
import { useAuth } from "./hooks/useAuth";
import { Pill } from "./components/Pill";
import { Matrix } from "./components/Matrix";
import { AIPanel } from "./components/AIPanel";
import { Form } from "./components/Form";
import { Card } from "./components/Card";
import { ImportPanel } from "./components/ImportPanel";
import { AuthButton } from "./components/AuthButton";
import { MigrationBanner } from "./components/MigrationBanner";
import { ProductContext } from "./components/ProductContext";
import { FeedbackDashboard } from "./components/FeedbackDashboard";
import { FeatureHistory } from "./components/FeatureHistory";
import * as feedbackLocal from "../lib/feedback-storage";
import { computeSummaryMetrics, buildScoreCalibration, buildAnalysisContext } from "../lib/feedback-context";

export default function App() {
  const [features, setFeatures] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWsId, setActiveWsId] = useState(null);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const wsDropdownRef = useRef(null);
  const [sortMode, setSortMode] = useState("rice");
  const [manualOrder, setManualOrder] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [importData, setImportData] = useState(null);
  const [showMigration, setShowMigration] = useState(false);
  const [productContext, setProductContext] = useState({ productSummary: "", targetUsers: "", strategicPriorities: "" });
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [feedbackContext, setFeedbackContext] = useState(null);
  const [undoSnapshot, setUndoSnapshot] = useState(null);
  const fileInputRef = useRef(null);
  const saveTimer = useRef(null);
  const ctxSaveTimer = useRef(null);
  const loadedRef = useRef(false);
  const isMobile = useMedia("(max-width: 800px)");
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { scored, sorted, maxScore } = useScored(features);
  const displayOrder = useMemo(() => {
    if (sortMode === "rice" || manualOrder.length === 0) return sorted;
    return manualOrder.map(id => scored.find(f => f.id === id)).filter(Boolean).concat(scored.filter(f => !manualOrder.includes(f.id)));
  }, [sortMode, sorted, scored, manualOrder]);

  // ── Init: load data from cloud or localStorage ──
  useEffect(() => {
    if (!authLoaded) return;
    loadedRef.current = false;
    setLoaded(false);
    let cancelled = false;
    async function init() {
      if (isSignedIn) {
        try {
          let ws = await cloud.fetchWorkspaces();
          if (ws.length === 0) {
            const newWs = await cloud.createWorkspace("My Backlog");
            ws = [newWs];
          }
          if (cancelled) return;
          setWorkspaces(ws.map(w => ({ id: w.id, name: w.name })));
          const activeId = ws[0].id;
          setActiveWsId(activeId);
          const data = await cloud.fetchFeatures(activeId);
          if (cancelled) return;
          setFeatures(data.features);
          setManualOrder(data.manualOrder || []);
          try { const ctx = await cloud.fetchProductContext(activeId); if (!cancelled) setProductContext(ctx); } catch {}
          // Check if localStorage has data to migrate
          const localWs = loadWsIndex();
          if (localWs && localWs.length > 0) setShowMigration(true);
        } catch (err) {
          console.error("Cloud init failed, falling back to localStorage:", err);
          initLocal();
        }
      } else {
        initLocal();
      }
      loadedRef.current = true;
      setLoaded(true);
    }
    function initLocal() {
      let ws = loadWsIndex();
      if (!ws || ws.length === 0) {
        ws = [{ id: "default", name: "My Backlog" }];
        const legacy = load();
        if (legacy && legacy.length > 0) {
          saveWsFeatures("default", legacy);
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
        } else {
          saveWsFeatures("default", []);
        }
        saveWsIndex(ws);
      }
      const activeId = getActiveWsId() || ws[0].id;
      setWorkspaces(ws);
      setActiveWsId(activeId);
      const saved = loadWsFeatures(activeId);
      if (saved) {
        setFeatures(saved.features);
        setManualOrder(saved.manualOrder || []);
      } else {
        setFeatures([]);
      }
      const ctx = loadWsContext(activeId);
      if (ctx) setProductContext(ctx);
    }
    init();
    return () => { cancelled = true; };
  }, [authLoaded, isSignedIn]);

  // ── Auto-save ──
  useEffect(() => {
    if (!loadedRef.current || !activeWsId) return;
    if (isSignedIn) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await cloud.syncFeatures(activeWsId, features, manualOrder);
        } catch (err) {
          console.error("Cloud save failed:", err);
        }
      }, 1000);
      return () => clearTimeout(saveTimer.current);
    } else {
      saveWsFeatures(activeWsId, features, manualOrder);
    }
  }, [features, manualOrder, loaded, activeWsId, isSignedIn]);

  // ── Auto-save product context ──
  useEffect(() => {
    if (!loadedRef.current || !activeWsId) return;
    if (isSignedIn) {
      clearTimeout(ctxSaveTimer.current);
      ctxSaveTimer.current = setTimeout(async () => {
        try { await cloud.saveProductContext(activeWsId, productContext); } catch (err) { console.error("Context save failed:", err); }
      }, 1000);
      return () => clearTimeout(ctxSaveTimer.current);
    } else {
      saveWsContext(activeWsId, productContext);
    }
  }, [productContext, loaded, activeWsId, isSignedIn]);

  useEffect(() => {
    if (!wsDropdownOpen) return;
    const handler = (e) => { if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target)) setWsDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [wsDropdownOpen]);

  const addFeature = (f) => { setFeatures(prev => prev.some(x => x.id === f.id) ? prev.map(x => x.id === f.id ? f : x) : [...prev, f]); setShowForm(false); setEditingFeature(null); };
  const deleteFeature = (id) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
    setManualOrder(prev => prev.filter(x => x !== id));
    if (selectedId === id) setSelectedId(null);
    if (isSignedIn && activeWsId) {
      cloud.deleteFeatureApi(activeWsId, id).catch(console.error);
    }
  };
  const editFeature = (f) => { const { score, ...raw } = f; setEditingFeature(raw); setShowForm(true); };
  const handleRevert = useCallback((revertedFeature) => {
    setFeatures(prev => prev.map(f =>
      f.id === revertedFeature.id
        ? { ...f, name: revertedFeature.name, description: revertedFeature.description, reach: revertedFeature.reach, impact: revertedFeature.impact, confidence: revertedFeature.confidence, effort: revertedFeature.effort }
        : f
    ));
  }, []);

  const handleDragStart = (id) => setDragId(id);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const currentOrder = manualOrder.length > 0 ? [...manualOrder] : sorted.map(f => f.id);
    const fromIdx = currentOrder.indexOf(dragId);
    const toIdx = currentOrder.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) { setDragId(null); return; }
    currentOrder.splice(fromIdx, 1);
    currentOrder.splice(toIdx, 0, dragId);
    setManualOrder(currentOrder);
    setSortMode("manual");
    setDragId(null);
  };
  const handleMove = (id, dir) => {
    const currentOrder = manualOrder.length > 0 ? [...manualOrder] : sorted.map(f => f.id);
    const idx = currentOrder.indexOf(id);
    const targetIdx = idx + dir;
    if (idx === -1 || targetIdx < 0 || targetIdx >= currentOrder.length) return;
    [currentOrder[idx], currentOrder[targetIdx]] = [currentOrder[targetIdx], currentOrder[idx]];
    setManualOrder(currentOrder);
    setSortMode("manual");
  };
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = mapCSVToFeatures(parseCSV(ev.target.result));
      if (result && result.features.length > 0) {
        setImportData(result);
        setShowForm(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const confirmImport = () => {
    if (!importData) return;
    setFeatures(prev => [...prev, ...importData.features]);
    setImportData(null);
  };

  const switchWorkspace = useCallback(async (wsId) => {
    if (isSignedIn) {
      try {
        const data = await cloud.fetchFeatures(wsId);
        setFeatures(data.features || []);
        setManualOrder(data.manualOrder || []);
        try { const ctx = await cloud.fetchProductContext(wsId); setProductContext(ctx); } catch { setProductContext({ productSummary: "", targetUsers: "", strategicPriorities: "" }); }
      } catch (err) {
        console.error("Failed to load workspace:", err);
        setFeatures([]);
        setManualOrder([]);
      }
    } else {
      if (loaded && activeWsId) saveWsFeatures(activeWsId, features, manualOrder);
      const saved = loadWsFeatures(wsId);
      setFeatures(saved?.features || []);
      setManualOrder(saved?.manualOrder || []);
      const ctx = loadWsContext(wsId);
      setProductContext(ctx || { productSummary: "", targetUsers: "", strategicPriorities: "" });
    }
    setActiveWsId(wsId);
    if (!isSignedIn) storeActiveWsId(wsId);
    setSelectedId(null);
    setShowForm(false);
    setEditingFeature(null);
    setSortMode("rice");
    setWsDropdownOpen(false);
  }, [isSignedIn, loaded, activeWsId, features, manualOrder]);

  const addWorkspace = async () => {
    const name = prompt("Workspace name:");
    if (!name?.trim()) return;
    if (isSignedIn) {
      try {
        const ws = await cloud.createWorkspace(name.trim());
        const updated = [...workspaces, { id: ws.id, name: ws.name }];
        setWorkspaces(updated);
        switchWorkspace(ws.id);
      } catch (err) {
        console.error("Failed to create workspace:", err);
      }
    } else {
      const ws = { id: `ws-${Date.now()}`, name: name.trim() };
      const updated = [...workspaces, ws];
      setWorkspaces(updated);
      saveWsIndex(updated);
      saveWsFeatures(ws.id, []);
      switchWorkspace(ws.id);
    }
  };
  const deleteWorkspace = async (wsId) => {
    if (workspaces.length <= 1) return;
    if (isSignedIn) {
      try { await cloud.deleteWorkspaceApi(wsId); } catch (err) { console.error(err); return; }
    } else {
      removeWsFeatures(wsId);
      removeWsContext(wsId);
    }
    const updated = workspaces.filter(w => w.id !== wsId);
    setWorkspaces(updated);
    if (!isSignedIn) saveWsIndex(updated);
    if (activeWsId === wsId) switchWorkspace(updated[0].id);
  };
  const renameWorkspace = async (wsId) => {
    const ws = workspaces.find(w => w.id === wsId);
    const name = prompt("New name:", ws?.name);
    if (!name?.trim()) return;
    if (isSignedIn) {
      try { await cloud.renameWorkspaceApi(wsId, name.trim()); } catch (err) { console.error(err); return; }
    }
    const updated = workspaces.map(w => w.id === wsId ? { ...w, name: name.trim() } : w);
    setWorkspaces(updated);
    if (!isSignedIn) saveWsIndex(updated);
  };

  const handleMigration = async () => {
    const localWs = loadWsIndex();
    if (!localWs) return;
    try {
      for (const lw of localWs) {
        const ws = await cloud.createWorkspace(lw.name);
        const saved = loadWsFeatures(lw.id);
        if (saved?.features) {
          for (const f of saved.features) {
            await cloud.upsertFeature(ws.id, f);
          }
        }
      }
      // Clear localStorage after successful migration
      for (const lw of localWs) removeWsFeatures(lw.id);
      try { localStorage.removeItem("prioritize-workspaces"); localStorage.removeItem("prioritize-active-workspace"); localStorage.removeItem(STORAGE_KEY); } catch {}
      setShowMigration(false);
      // Reload cloud data
      const ws = await cloud.fetchWorkspaces();
      setWorkspaces(ws.map(w => ({ id: w.id, name: w.name })));
    } catch (err) {
      console.error("Migration failed:", err);
    }
  };

  // ── Load feedback data for current workspace ──
  useEffect(() => {
    if (!loaded || !activeWsId) return;
    if (isSignedIn) {
      cloud.fetchFeedbackSummary(activeWsId).then(setFeedbackSummary).catch(() => setFeedbackSummary(null));
      cloud.fetchFeedbackContext(activeWsId).then(setFeedbackContext).catch(() => setFeedbackContext(null));
    } else {
      const scoreEvents = feedbackLocal.loadScoreEvents(activeWsId);
      const analysisEvents = feedbackLocal.loadAnalysisEvents(activeWsId);
      setFeedbackSummary(computeSummaryMetrics(scoreEvents, analysisEvents));
      setFeedbackContext({
        scoreCalibration: buildScoreCalibration(scoreEvents),
        analysisContext: buildAnalysisContext(analysisEvents),
      });
    }
  }, [loaded, activeWsId, isSignedIn]);

  const refreshFeedback = useCallback(() => {
    if (!activeWsId) return;
    if (isSignedIn) {
      cloud.fetchFeedbackSummary(activeWsId).then(setFeedbackSummary).catch(() => {});
      cloud.fetchFeedbackContext(activeWsId).then(setFeedbackContext).catch(() => {});
    } else {
      const scoreEvents = feedbackLocal.loadScoreEvents(activeWsId);
      const analysisEvents = feedbackLocal.loadAnalysisEvents(activeWsId);
      setFeedbackSummary(computeSummaryMetrics(scoreEvents, analysisEvents));
      setFeedbackContext({
        scoreCalibration: buildScoreCalibration(scoreEvents),
        analysisContext: buildAnalysisContext(analysisEvents),
      });
    }
  }, [activeWsId, isSignedIn]);

  // ── Feedback handlers ──
  const handleScoreEvent = useCallback(async (events) => {
    if (!activeWsId) return;
    if (isSignedIn) {
      try { await cloud.postScoreEvents(activeWsId, events); } catch (err) { console.error("Score event failed:", err); }
    } else {
      for (const e of events) feedbackLocal.saveScoreEvent(activeWsId, e);
    }
  }, [activeWsId, isSignedIn]);

  const handleResolveScores = useCallback(async (featureId, finalScores) => {
    if (!activeWsId) return;
    if (isSignedIn) {
      try { await cloud.resolveScoreEvents(activeWsId, featureId, finalScores); } catch (err) { console.error("Resolve scores failed:", err); }
    } else {
      feedbackLocal.resolveScoreEvents(activeWsId, featureId, finalScores);
    }
    refreshFeedback();
  }, [activeWsId, isSignedIn, refreshFeedback]);

  const handleAnalysisEvent = useCallback(async (event) => {
    if (!activeWsId) return null;
    if (isSignedIn) {
      try {
        const result = await cloud.postAnalysisEvent(activeWsId, event);
        return result.id;
      } catch (err) { console.error("Analysis event failed:", err); return null; }
    } else {
      const saved = feedbackLocal.saveAnalysisEvent(activeWsId, event);
      return saved.id;
    }
  }, [activeWsId, isSignedIn]);

  const handleAnalysisFeedback = useCallback(async (eventId, thumbsUp) => {
    if (!activeWsId || !eventId) return;
    if (isSignedIn) {
      try { await cloud.updateAnalysisEvent(activeWsId, eventId, { thumbs_up: thumbsUp }); } catch (err) { console.error("Analysis feedback failed:", err); }
    } else {
      feedbackLocal.updateAnalysisEvent(activeWsId, eventId, { thumbs_up: thumbsUp });
    }
    refreshFeedback();
  }, [activeWsId, isSignedIn, refreshFeedback]);

  const activeWs = workspaces.find(w => w.id === activeWsId);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@media print { body { background: #fff !important; -webkit-print-color-adjust: exact; } [data-no-print] { display: none !important; } div { break-inside: avoid; } }`}</style>

      <header style={{ padding: "24px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${C.accent}30` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", background: `linear-gradient(135deg, ${C.text}, ${C.textMuted})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Prioritize</h1>
            <p style={{ fontSize: 11, color: C.textMuted, margin: 0, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>AI-POWERED RICE FRAMEWORK</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div ref={wsDropdownRef} style={{ position: "relative" }}>
            <button onClick={() => setWsDropdownOpen(!wsDropdownOpen)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {activeWs?.name || "Backlog"} <span style={{ fontSize: 8, color: C.textMuted }}>{wsDropdownOpen ? "▲" : "▼"}</span>
            </button>
            {wsDropdownOpen && <div style={{ position: "absolute", top: "calc(100% + 4px)", ...(isMobile ? { left: 0 } : { right: 0 }), minWidth: 200, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: `0 8px 24px ${C.bg}80`, zIndex: 100, overflow: "hidden" }}>
              {workspaces.map(w => (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: w.id === activeWsId ? C.accentGlow : "transparent", cursor: "pointer" }}
                  onClick={() => { if (w.id !== activeWsId) switchWorkspace(w.id); else setWsDropdownOpen(false); }}>
                  <span style={{ flex: 1, fontSize: 12, color: w.id === activeWsId ? C.accent : C.text, fontWeight: w.id === activeWsId ? 700 : 400 }}>{w.name}</span>
                  <button onClick={e => { e.stopPropagation(); renameWorkspace(w.id); }} style={{ padding: "2px 5px", border: "none", background: "transparent", color: C.textMuted, fontSize: 10, cursor: "pointer" }} title="Rename">✎</button>
                  {workspaces.length > 1 && <button onClick={e => { e.stopPropagation(); deleteWorkspace(w.id); }} style={{ padding: "2px 5px", border: "none", background: "transparent", color: C.danger + "80", fontSize: 10, cursor: "pointer" }} title="Delete">✕</button>}
                </div>
              ))}
              <button onClick={addWorkspace} style={{ width: "100%", padding: "8px 12px", border: "none", background: "transparent", color: C.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", textAlign: "left" }}
                onMouseEnter={e => e.target.style.background = C.accentGlow} onMouseLeave={e => e.target.style.background = "transparent"}>+ New Workspace</button>
            </div>}
          </div>
          <Pill color={C.accent} dimColor={C.accentDim} small>{features.length} FEATURES</Pill>
          <Pill color={C.blue} dimColor={C.blueDim} small>RICE</Pill>
          <button data-no-print onClick={() => fileInputRef.current?.click()} style={{ padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 6, background: "transparent", color: C.textMuted, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.borderColor = C.blue; e.target.style.color = C.blue; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted; }}>↑ Import</button>
          <button data-no-print onClick={() => exportCSV(displayOrder, activeWs?.name)} style={{ padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 6, background: "transparent", color: C.textMuted, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted; }}>↓ CSV</button>
          <button data-no-print onClick={() => window.print()} style={{ padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 6, background: "transparent", color: C.textMuted, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.borderColor = C.purple; e.target.style.color = C.purple; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted; }}>⎙ PDF</button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleImportFile} style={{ display: "none" }} />
          <div data-no-print style={{ marginLeft: "auto" }}><AuthButton /></div>
        </div>
      </header>

      {showMigration && <MigrationBanner onConfirm={handleMigration} onDismiss={() => setShowMigration(false)} />}

      <div style={{ display: isMobile ? "flex" : "grid", flexDirection: isMobile ? "column" : undefined, gridTemplateColumns: isMobile ? undefined : "minmax(300px, 380px) 1fr", minHeight: "calc(100vh - 85px)" }}>
        <div style={{ borderRight: isMobile ? "none" : `1px solid ${C.border}`, borderBottom: isMobile ? `1px solid ${C.border}` : "none", padding: 20, overflowY: "auto", maxHeight: isMobile ? "none" : "calc(100vh - 85px)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div data-no-print style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setEditingFeature(null); setShowForm(true); }} style={{ flex: 1, padding: "10px 16px", border: `1px dashed ${C.accent}50`, borderRadius: 8, background: C.accentGlow, color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
              onMouseEnter={e => e.target.style.background = C.accentDim} onMouseLeave={e => e.target.style.background = C.accentGlow}>+ Add Feature</button>
            <button onClick={() => { setUndoSnapshot({ features, selectedId, manualOrder, sortMode }); setFeatures(SAMPLES); setSelectedId(null); setManualOrder([]); setSortMode("rice"); }} style={{ padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }} title="Load sample features">↻ Samples</button>
            <button onClick={() => { setUndoSnapshot({ features, selectedId, manualOrder, sortMode }); setFeatures([]); setSelectedId(null); setManualOrder([]); setSortMode("rice"); }} style={{ padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.danger || "#ef4444", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }} title="Clear all features">✕ Clear</button>
            {undoSnapshot && <button onClick={() => { setFeatures(undoSnapshot.features); setSelectedId(undoSnapshot.selectedId); setManualOrder(undoSnapshot.manualOrder); setSortMode(undoSnapshot.sortMode); setUndoSnapshot(null); }} style={{ padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.warn || "#facc15", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }} title="Undo last action">↩ Undo</button>}
          </div>
          {showForm && <Form key={editingFeature?.id || "new"} onAdd={addFeature} onCancel={() => { setShowForm(false); setEditingFeature(null); }} editFeature={editingFeature} productContext={productContext} onScoreEvent={handleScoreEvent} onResolveScores={handleResolveScores} feedbackContext={feedbackContext} />}
          {importData && <ImportPanel importData={importData} onConfirm={confirmImport} onCancel={() => setImportData(null)} />}
          {scored.length > 1 && <div style={{ display: "flex", gap: 2, background: C.border, borderRadius: 6, padding: 2 }}>
            <button onClick={() => setSortMode("rice")} style={{ flex: 1, padding: "5px 10px", borderRadius: 4, border: "none", fontSize: 10, fontWeight: 600, background: sortMode === "rice" ? C.surface : "transparent", color: sortMode === "rice" ? C.accent : C.textMuted, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>RICE Sort</button>
            <button onClick={() => { if (manualOrder.length === 0) setManualOrder(sorted.map(f => f.id)); setSortMode("manual"); }} style={{ flex: 1, padding: "5px 10px", borderRadius: 4, border: "none", fontSize: 10, fontWeight: 600, background: sortMode === "manual" ? C.surface : "transparent", color: sortMode === "manual" ? C.warn : C.textMuted, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>Manual Order</button>
          </div>}
          {displayOrder.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 13, color: C.textMuted }}>No features yet. Add your first feature or load samples.</p></div>
          ) : displayOrder.map((f, i) => (
            <div key={f.id}>
              <Card feature={f} rank={i + 1} isSelected={f.id === selectedId} onClick={() => setSelectedId(f.id === selectedId ? null : f.id)} onDelete={deleteFeature} onEdit={editFeature} maxScore={maxScore} draggable={sortMode === "manual" && !isMobile} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} isDragging={dragId === f.id} showMoveButtons={sortMode === "manual" && isMobile} onMove={handleMove} isFirst={i === 0} isLast={i === displayOrder.length - 1} />
              {f.id === selectedId && isSignedIn && activeWsId && (
                <FeatureHistory wsId={activeWsId} featureId={f.id} onRevert={handleRevert} />
              )}
            </div>
          ))}
        </div>

        <div data-no-print style={{ padding: 24, overflowY: "auto", maxHeight: isMobile ? "none" : "calc(100vh - 85px)", display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Priority Matrix</h2>
              <Pill color={C.textMuted} dimColor={C.border} small>EFFORT vs IMPACT</Pill>
            </div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, background: C.surface, padding: "16px 12px 8px", overflow: "hidden" }}>
              {scored.length > 0 ? <Matrix scored={scored} maxScore={maxScore} selectedId={selectedId} onSelect={setSelectedId} /> : <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: 13, color: C.textDim }}>Add features to see the priority matrix</p></div>}
            </div>
          </div>
          <ProductContext context={productContext} onChange={setProductContext} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>AI Strategy Advisor</h2>
              <Pill color={C.purple} dimColor={C.purpleDim} small>CLAUDE</Pill>
            </div>
            <AIPanel scored={scored} productContext={productContext} onAnalysisEvent={handleAnalysisEvent} onAnalysisFeedback={handleAnalysisFeedback} feedbackContext={feedbackContext} />
          </div>
          <FeedbackDashboard summary={feedbackSummary} />
          <div style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, display: "flex", flexWrap: "wrap", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
            <div>
              <span style={{ fontSize: 9, color: C.textDim, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>RICE FORMULA</span>
              <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>(Reach × Impact × Confidence) ÷ Effort</p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginLeft: isMobile ? 0 : "auto" }}>
              {[{ l: "QUICK WIN", c: C.accent }, { l: "STRATEGIC", c: C.blue }, { l: "LOW HANG", c: C.warn }, { l: "MONEY PIT", c: C.danger }].map(t => (
                <div key={t.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.c }} />
                  <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{t.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
