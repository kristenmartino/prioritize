import { C } from "../theme";
import { CandidateDetail } from "./CandidateDetail";
import { ProductContext } from "./ProductContext";
import { AIPanel } from "./AIPanel";
import { FeedbackDashboard } from "./FeedbackDashboard";
import { Pill } from "./Pill";

export const RightRail = ({
  selectedFeature, onDeselect,
  scored, maxScore,
  onEditFeature, onDeleteFeature, onRevert,
  productContext, onProductContextChange,
  onAnalysisEvent, onAnalysisFeedback,
  feedbackContext, feedbackSummary,
  isSignedIn, activeWsId,
  isMobile, isTablet,
  signals, onScreenChange,
  onAddDecision,
}) => {
  const isOverlay = isMobile || isTablet;

  const content = selectedFeature ? (
    <CandidateDetail
      feature={selectedFeature}
      maxScore={maxScore}
      onEdit={onEditFeature}
      onDelete={onDeleteFeature}
      onDeselect={onDeselect}
      isSignedIn={isSignedIn}
      activeWsId={activeWsId}
      onRevert={onRevert}
      signals={signals}
      onScreenChange={onScreenChange}
    />
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ProductContext context={productContext} onChange={onProductContextChange} />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Decision Advisor</h2>
          <Pill color={C.purple} dimColor={C.purpleDim} small>AI</Pill>
        </div>
        <p style={{ fontSize: 10, color: C.textDim, margin: "0 0 12px", lineHeight: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>
          Recommendation generated from current candidate scores, strategy context, and available signals.
        </p>
        <AIPanel scored={scored} productContext={productContext} onAnalysisEvent={onAnalysisEvent} onAnalysisFeedback={onAnalysisFeedback} feedbackContext={feedbackContext} onSaveDecisionDraft={onAddDecision} onScreenChange={onScreenChange} />
      </div>
      <FeedbackDashboard summary={feedbackSummary} />
    </div>
  );

  if (isOverlay && !selectedFeature) return null;

  if (isOverlay) {
    return (
      <>
        {/* Backdrop */}
        <div onClick={onDeselect} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 199,
        }} />
        {/* Panel */}
        <div style={{
          position: "fixed", top: isMobile ? "10%" : 0, right: 0, bottom: 0,
          width: isMobile ? "100%" : 360, background: C.surface,
          borderLeft: `1px solid ${C.border}`,
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0,
          zIndex: 200,
          overflowY: "auto", padding: "8px 20px 20px",
          boxShadow: `-8px 0 32px ${C.bg}80`,
        }}>
          {/* Drag handle */}
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "center", padding: "4px 0 12px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
            </div>
          )}
          {content}
        </div>
      </>
    );
  }

  return (
    <div style={{
      borderLeft: `1px solid ${C.border}`,
      overflowY: "auto", height: "calc(100vh - 48px)", position: "sticky", top: 48,
      padding: 20, boxSizing: "border-box",
      display: "flex", flexDirection: "column",
      flexShrink: 0,
    }}>
      {content}
    </div>
  );
};
