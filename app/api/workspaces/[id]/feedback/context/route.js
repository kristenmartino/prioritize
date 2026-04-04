import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../../lib/api-auth";
import { buildScoreCalibration, buildAnalysisContext } from "../../../../../../lib/feedback-context";

export async function GET(request, { params }) {
  const { id } = await params;
  return withAuth(async (userId, supabase) => {
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [scoreRes, analysisRes] = await Promise.all([
      supabase.from("ai_score_events").select("*").eq("workspace_id", id).eq("outcome", "accepted").or("outcome.eq.adjusted"),
      supabase.from("ai_analysis_events").select("*").eq("workspace_id", id).order("created_at"),
    ]);

    // Re-fetch all resolved for calibration (above filter was wrong, need all resolved)
    const allScoreRes = await supabase.from("ai_score_events").select("*").eq("workspace_id", id).neq("outcome", "pending");

    return NextResponse.json({
      scoreCalibration: buildScoreCalibration(allScoreRes.data || []),
      analysisContext: buildAnalysisContext(analysisRes.data || []),
    });
  });
}
