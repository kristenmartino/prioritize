import { C, SAMPLES } from "../theme";
import { exportCSV } from "../utils";
import { Pill } from "./Pill";
import { Form } from "./Form";
import { Card } from "./Card";
import { ImportPanel } from "./ImportPanel";
import { Matrix } from "./Matrix";
import { MapControls } from "./MapControls";
import { PlaceholderScreen } from "./PlaceholderScreen";
import { FeatureHistory } from "./FeatureHistory";
import { DecisionsScreen } from "./DecisionsScreen";
import { SignalsScreen } from "./SignalsScreen";
import { ScenariosScreen } from "./ScenariosScreen";

const PLACEHOLDER_SCREENS = {
  settings: { title: "Settings", description: "Configure workspace settings, scoring frameworks, and team preferences.", icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/></svg>
  )},
};

export const CenterCanvas = ({
  activeScreen, viewMode, onViewModeChange,
  features, scored, sorted, displayOrder, maxScore,
  selectedId, onSelect,
  showForm, onShowForm, editingFeature, onEditingFeature,
  onAddFeature, onDeleteFeature, onEditFeature,
  sortMode, onSortModeChange,
  manualOrder, onManualOrderChange,
  onDragStart, onDragOver, onDrop, dragId, onMove,
  undoSnapshot, onUndo, onLoadSamples, onClear,
  importData, onConfirmImport, onCancelImport,
  onImportFile, onExportCSV,
  productContext, onScoreEvent, onResolveScores, feedbackContext,
  isMobile,
  mapColorBy, mapSizeBy, mapLabelMode,
  onMapColorByChange, onMapSizeByChange, onMapLabelModeChange,
  // Mobile workspace switcher props
  activeWs, workspaces, onSwitchWorkspace, onAddWorkspace, onDeleteWorkspace, onRenameWorkspace,
  isSignedIn, activeWsId,
  // Decisions & Signals
  decisions, signals,
  onAddDecision, onUpdateDecision, onDeleteDecision,
  onAddSignal, onUpdateSignal, onDeleteSignal, onImportSignals,
}) => {
  // Non-priorities screens
  if (activeScreen === "decisions") return <DecisionsScreen decisions={decisions} scored={scored} onAdd={onAddDecision} onUpdate={onUpdateDecision} onDelete={onDeleteDecision} />;
  if (activeScreen === "signals") return <SignalsScreen signals={signals} scored={scored} onAdd={onAddSignal} onUpdate={onUpdateSignal} onDelete={onDeleteSignal} onImport={onImportSignals} />;
  if (activeScreen === "scenarios") return <ScenariosScreen features={features} scored={scored} sorted={sorted} activeWsId={activeWsId} isSignedIn={isSignedIn} onSelect={onSelect} isMobile={isMobile} />;
  if (activeScreen !== "priorities") {
    const ph = PLACEHOLDER_SCREENS[activeScreen];
    if (ph) return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{ph.title}</h2>
          <Pill color={C.textDim} dimColor={C.border} small>COMING SOON</Pill>
        </div>
        <PlaceholderScreen title={ph.title} description={ph.description} icon={ph.icon} />
      </div>
    );
    return null;
  }

  const headerBtnStyle = { padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 6, background: "transparent", color: C.textMuted, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      {/* Header bar */}
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Priorities</h2>
        <Pill color={C.accent} dimColor={C.accentDim} small>{features.length} CANDIDATES</Pill>
        <Pill color={C.blue} dimColor={C.blueDim} small>RICE</Pill>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {/* View toggle */}
          <div style={{ display: "flex", gap: 2, background: C.border, borderRadius: 6, padding: 2 }}>
            <button onClick={() => onViewModeChange("list")} style={{
              padding: "4px 10px", borderRadius: 4, border: "none", fontSize: 10, fontWeight: 600,
              background: viewMode === "list" ? C.surface : "transparent",
              color: viewMode === "list" ? C.accent : C.textMuted,
              cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
            }}>List</button>
            <button onClick={() => onViewModeChange("map")} style={{
              padding: "4px 10px", borderRadius: 4, border: "none", fontSize: 10, fontWeight: 600,
              background: viewMode === "map" ? C.surface : "transparent",
              color: viewMode === "map" ? C.accent : C.textMuted,
              cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
            }}>Map</button>
          </div>

          <button data-no-print onClick={onImportFile} style={headerBtnStyle}
            onMouseEnter={e => { e.target.style.borderColor = C.blue; e.target.style.color = C.blue; }}
            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted; }}>↑ Import</button>
          <button data-no-print onClick={onExportCSV} style={headerBtnStyle}
            onMouseEnter={e => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }}
            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted; }}>↓ CSV</button>
          <button data-no-print onClick={() => window.print()} style={headerBtnStyle}
            onMouseEnter={e => { e.target.style.borderColor = C.purple; e.target.style.color = C.purple; }}
            onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted; }}>⎙ PDF</button>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: isMobile ? "none" : "calc(100vh - 48px - 52px)", padding: 20, display: "flex", flexDirection: "column", gap: 12, paddingBottom: isMobile ? 72 : 20 }}>
        {viewMode === "list" ? (
          <>
            <div data-no-print style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { onEditingFeature(null); onShowForm(true); }} style={{ flex: 1, padding: "10px 16px", border: `1px dashed ${C.accent}50`, borderRadius: 8, background: C.accentGlow, color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
                onMouseEnter={e => e.target.style.background = C.accentDim} onMouseLeave={e => e.target.style.background = C.accentGlow}>+ Add Candidate</button>
              <button onClick={onLoadSamples} style={{ padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }} title="Load example backlog">↻ Samples</button>
              <button onClick={onClear} style={{ padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.danger, fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }} title="Clear workspace">✕ Clear</button>
              {undoSnapshot && <button onClick={onUndo} style={{ padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.warn, fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }} title="Undo last action">↩ Undo</button>}
            </div>
            {showForm && <Form key={editingFeature?.id || "new"} onAdd={onAddFeature} onCancel={() => { onShowForm(false); onEditingFeature(null); }} editFeature={editingFeature} productContext={productContext} onScoreEvent={onScoreEvent} onResolveScores={onResolveScores} feedbackContext={feedbackContext} />}
            {importData && <ImportPanel importData={importData} onConfirm={onConfirmImport} onCancel={onCancelImport} />}
            {scored.length > 1 && <div style={{ display: "flex", gap: 2, background: C.border, borderRadius: 6, padding: 2 }}>
              <button onClick={() => onSortModeChange("rice")} style={{ flex: 1, padding: "5px 10px", borderRadius: 4, border: "none", fontSize: 10, fontWeight: 600, background: sortMode === "rice" ? C.surface : "transparent", color: sortMode === "rice" ? C.accent : C.textMuted, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>Framework Rank</button>
              <button onClick={() => { if (manualOrder.length === 0) onManualOrderChange(sorted.map(f => f.id)); onSortModeChange("manual"); }} style={{ flex: 1, padding: "5px 10px", borderRadius: 4, border: "none", fontSize: 10, fontWeight: 600, background: sortMode === "manual" ? C.surface : "transparent", color: sortMode === "manual" ? C.warn : C.textMuted, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>Judgment Override</button>
            </div>}
            {displayOrder.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 13, color: C.textMuted }}>No candidates yet. Add your first candidate or load examples.</p></div>
            ) : displayOrder.map((f, i) => (
              <div key={f.id}>
                <Card feature={f} rank={i + 1} isSelected={f.id === selectedId} onClick={() => onSelect(f.id === selectedId ? null : f.id)} onDelete={onDeleteFeature} onEdit={onEditFeature} maxScore={maxScore} draggable={sortMode === "manual" && !isMobile} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} isDragging={dragId === f.id} showMoveButtons={sortMode === "manual" && isMobile} onMove={onMove} isFirst={i === 0} isLast={i === displayOrder.length - 1} />
                {f.id === selectedId && isMobile && isSignedIn && activeWsId && (
                  <FeatureHistory wsId={activeWsId} featureId={f.id} feature={f} />
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            <MapControls colorBy={mapColorBy} sizeBy={mapSizeBy} labelMode={mapLabelMode} onColorByChange={onMapColorByChange} onSizeByChange={onMapSizeByChange} onLabelModeChange={onMapLabelModeChange} />
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, background: C.surface, padding: "16px 12px 8px", overflow: "hidden" }}>
              {scored.length > 0 ? <Matrix scored={scored} maxScore={maxScore} selectedId={selectedId} onSelect={onSelect} colorBy={mapColorBy} sizeBy={mapSizeBy} labelMode={mapLabelMode} /> : <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontSize: 13, color: C.textDim }}>Add candidates to see the tradeoff map</p></div>}
            </div>
            <div style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, display: "flex", flexWrap: "wrap", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
              <div>
                <span style={{ fontSize: 9, color: C.textDim, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>RICE FORMULA</span>
                <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>(Reach × Impact × Confidence) ÷ Effort</p>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginLeft: isMobile ? 0 : "auto" }}>
                {[{ l: "QUICK WIN", c: C.accent }, { l: "STRATEGIC", c: C.blue }, { l: "FILL-IN", c: C.warn }, { l: "AVOID", c: C.danger }].map(t => (
                  <div key={t.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.c }} />
                    <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{t.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
