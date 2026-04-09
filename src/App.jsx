import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { C, SAMPLES } from "./theme";
import { exportCSV, parseCSV, mapCSVToFeatures } from "./utils";
import { load, saveWsIndex, loadWsIndex, saveWsFeatures, loadWsFeatures, removeWsFeatures, saveWsContext, loadWsContext, removeWsContext, getActiveWsId, setActiveWsId as storeActiveWsId, STORAGE_KEY } from "../lib/local-storage";
import * as cloud from "../lib/cloud-storage";
import { useMedia } from "./hooks/useMedia";
import { useScored } from "./hooks/useScored";
import { useAuth } from "./hooks/useAuth";
import { MigrationBanner } from "./components/MigrationBanner";
import { LeftRail } from "./components/LeftRail";
import { CenterCanvas } from "./components/CenterCanvas";
import { RightRail } from "./components/RightRail";
import * as feedbackLocal from "../lib/feedback-storage";
import { computeSummaryMetrics, buildScoreCalibration, buildAnalysisContext } from "../lib/feedback-context";

const printStyles = `@media print { body { background: #fff !important; -webkit-print-color-adjust: exact; } [data-no-print] { display: none !important; } div { break-inside: avoid; } }`;

export default function App() {
  const [features, setFeatures] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWsId, setActiveWsId] = useState(null);
  const [sortMode, setSortMode] = useState("rice");
  const [manualOrder, setManualOrder] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [importData, setImportData] = useState(null);
  const [showMigration, setShowMigration] = useState(false);
  const [productContext, setProductContext] = useState({ productSummary: "", targetUsers: "", strategicPriorities: "", constraints: "", assumptions: "", successMetrics: "" });
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [feedbackContext, setFeedbackContext] = useState(null);
  const [undoSnapshot, setUndoSnapshot] = useState(null);
  const [activeScreen, setActiveScreen] = useState("priorities");
  const [viewMode, setViewMode] = useState("list");
  const [mapColorBy, setMapColorBy] = useState("tier");
  const [mapSizeBy, setMapSizeBy] = useState("uniform");
  const [mapLabelMode, setMapLabelMode] = useState("hover");
  const fileInputRef = useRef(null);
  const saveTimer = useRef(null);
  const ctxSaveTimer = useRef(null);
  const loadedRef = useRef(false);
  const isMobile = useMedia("(max-width: 800px)");
  const isTablet = useMedia("(max-width: 1024px)") && !isMobile;
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { scored, sorted, maxScore } = useScored(features);
  const displayOrder = useMemo(() => {
    if (sortMode === "rice" || manualOrder.length === 0) return sorted;
    return manualOrder.map(id => scored.find(f => f.id === id)).filter(Boolean).concat(scored.filter(f => !manualOrder.includes(f.id)));
  }, [sortMode, sorted, scored, manualOrder]);

  const selectedFeature = useMemo(() =>
    selectedId ? scored.find(f => f.id === selectedId) || null : null,
  [selectedId, scored]);

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
        try { const ctx = await cloud.fetchProductContext(wsId); setProductContext(ctx); } catch { setProductContext({ productSummary: "", targetUsers: "", strategicPriorities: "", constraints: "", assumptions: "", successMetrics: "" }); }
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
      setProductContext(ctx || { productSummary: "", targetUsers: "", strategicPriorities: "", constraints: "", assumptions: "", successMetrics: "" });
    }
    setActiveWsId(wsId);
    if (!isSignedIn) storeActiveWsId(wsId);
    setSelectedId(null);
    setShowForm(false);
    setEditingFeature(null);
    setSortMode("rice");
    setViewMode("list");
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

  const handleScreenChange = useCallback((screen) => {
    setActiveScreen(screen);
    setSelectedId(null);
  }, []);

  const handleLoadSamples = useCallback(() => {
    setUndoSnapshot({ features, selectedId, manualOrder, sortMode });
    setFeatures(SAMPLES);
    setSelectedId(null);
    setManualOrder([]);
    setSortMode("rice");
  }, [features, selectedId, manualOrder, sortMode]);

  const handleClear = useCallback(() => {
    setUndoSnapshot({ features, selectedId, manualOrder, sortMode });
    setFeatures([]);
    setSelectedId(null);
    setManualOrder([]);
    setSortMode("rice");
  }, [features, selectedId, manualOrder, sortMode]);

  const handleUndo = useCallback(() => {
    if (!undoSnapshot) return;
    setFeatures(undoSnapshot.features);
    setSelectedId(undoSnapshot.selectedId);
    setManualOrder(undoSnapshot.manualOrder);
    setSortMode(undoSnapshot.sortMode);
    setUndoSnapshot(null);
  }, [undoSnapshot]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }}>
      <style>{printStyles}</style>
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleImportFile} style={{ display: "none" }} />

      {showMigration && <MigrationBanner onConfirm={handleMigration} onDismiss={() => setShowMigration(false)} />}

      <div style={{
        display: isMobile ? "flex" : "grid",
        flexDirection: isMobile ? "column" : undefined,
        gridTemplateColumns: isMobile ? undefined
          : isTablet ? "64px 1fr"
          : "64px 1fr 360px",
        minHeight: "100vh",
      }}>
        {!isMobile && (
          <LeftRail
            activeScreen={activeScreen} onScreenChange={handleScreenChange}
            activeWs={activeWs} workspaces={workspaces}
            onSwitchWorkspace={switchWorkspace} onAddWorkspace={addWorkspace}
            onDeleteWorkspace={deleteWorkspace} onRenameWorkspace={renameWorkspace}
            isMobile={false} isSignedIn={isSignedIn}
          />
        )}

        <CenterCanvas
          activeScreen={activeScreen} viewMode={viewMode} onViewModeChange={setViewMode}
          features={features} scored={scored} sorted={sorted} displayOrder={displayOrder}
          maxScore={maxScore} selectedId={selectedId} onSelect={setSelectedId}
          showForm={showForm} onShowForm={setShowForm}
          editingFeature={editingFeature} onEditingFeature={setEditingFeature}
          onAddFeature={addFeature} onDeleteFeature={deleteFeature} onEditFeature={editFeature}
          sortMode={sortMode} onSortModeChange={setSortMode}
          manualOrder={manualOrder} onManualOrderChange={setManualOrder}
          onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
          dragId={dragId} onMove={handleMove}
          undoSnapshot={undoSnapshot} onUndo={handleUndo} onLoadSamples={handleLoadSamples} onClear={handleClear}
          importData={importData} onConfirmImport={confirmImport} onCancelImport={() => setImportData(null)}
          onImportFile={() => fileInputRef.current?.click()}
          onExportCSV={() => exportCSV(displayOrder, activeWs?.name)}
          productContext={productContext} onScoreEvent={handleScoreEvent}
          onResolveScores={handleResolveScores} feedbackContext={feedbackContext}
          isMobile={isMobile}
          mapColorBy={mapColorBy} mapSizeBy={mapSizeBy} mapLabelMode={mapLabelMode}
          onMapColorByChange={setMapColorBy} onMapSizeByChange={setMapSizeBy}
          onMapLabelModeChange={setMapLabelMode}
          activeWs={activeWs} workspaces={workspaces}
          onSwitchWorkspace={switchWorkspace} onAddWorkspace={addWorkspace}
          onDeleteWorkspace={deleteWorkspace} onRenameWorkspace={renameWorkspace}
          isSignedIn={isSignedIn} activeWsId={activeWsId}
        />

        {!isMobile && !isTablet && (
          <RightRail
            selectedFeature={selectedFeature} onDeselect={() => setSelectedId(null)}
            scored={scored} maxScore={maxScore}
            onEditFeature={editFeature} onDeleteFeature={deleteFeature}
            onRevert={handleRevert}
            productContext={productContext} onProductContextChange={setProductContext}
            onAnalysisEvent={handleAnalysisEvent}
            onAnalysisFeedback={handleAnalysisFeedback}
            feedbackContext={feedbackContext} feedbackSummary={feedbackSummary}
            isSignedIn={isSignedIn} activeWsId={activeWsId}
            isMobile={false} isTablet={false}
          />
        )}
      </div>

      {/* Tablet: right rail as overlay when candidate selected */}
      {isTablet && selectedFeature && (
        <RightRail
          selectedFeature={selectedFeature} onDeselect={() => setSelectedId(null)}
          scored={scored} maxScore={maxScore}
          onEditFeature={editFeature} onDeleteFeature={deleteFeature}
          onRevert={handleRevert}
          productContext={productContext} onProductContextChange={setProductContext}
          onAnalysisEvent={handleAnalysisEvent}
          onAnalysisFeedback={handleAnalysisFeedback}
          feedbackContext={feedbackContext} feedbackSummary={feedbackSummary}
          isSignedIn={isSignedIn} activeWsId={activeWsId}
          isMobile={false} isTablet={true}
        />
      )}

      {/* Mobile: right rail as full-screen overlay when candidate selected */}
      {isMobile && selectedFeature && (
        <RightRail
          selectedFeature={selectedFeature} onDeselect={() => setSelectedId(null)}
          scored={scored} maxScore={maxScore}
          onEditFeature={editFeature} onDeleteFeature={deleteFeature}
          onRevert={handleRevert}
          productContext={productContext} onProductContextChange={setProductContext}
          onAnalysisEvent={handleAnalysisEvent}
          onAnalysisFeedback={handleAnalysisFeedback}
          feedbackContext={feedbackContext} feedbackSummary={feedbackSummary}
          isSignedIn={isSignedIn} activeWsId={activeWsId}
          isMobile={true} isTablet={false}
        />
      )}

      {/* Mobile: bottom tab bar */}
      {isMobile && (
        <LeftRail
          activeScreen={activeScreen} onScreenChange={handleScreenChange}
          activeWs={activeWs} workspaces={workspaces}
          onSwitchWorkspace={switchWorkspace} onAddWorkspace={addWorkspace}
          onDeleteWorkspace={deleteWorkspace} onRenameWorkspace={renameWorkspace}
          isMobile={true} isSignedIn={isSignedIn}
        />
      )}
    </div>
  );
}
