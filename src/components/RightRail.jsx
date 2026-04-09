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
    />
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ProductContext context={productContext} onChange={onProductContextChange} />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Decision Advisor</h2>
          <Pill color={C.purple} dimColor={C.purpleDim} small>AI</Pill>
        </div>
        <AIPanel scored={scored} productContext={productContext} onAnalysisEvent={onAnalysisEvent} onAnalysisFeedback={onAnalysisFeedback} feedbackContext={feedbackContext} />
      </div>
      <FeedbackDashboard summary={feedbackSummary} />
    </div>
  );

  if (isOverlay && !selectedFeature) return null;

  if (isOverlay) {
    return (
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: isMobile ? "100%" : 360, background: C.surface,
        borderLeft: `1px solid ${C.border}`, zIndex: 200,
        overflowY: "auto", padding: 20,
        boxShadow: `-8px 0 32px ${C.bg}80`,
      }}>
        {content}
      </div>
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
