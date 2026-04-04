import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../../lib/api-auth";
import { computeSummaryMetrics } from "../../../../../../lib/feedback-context";

export async function GET(request, { params }) {
  const { id } = await params;
  return withAuth(async (userId, supabase) => {
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [scoreRes, analysisRes] = await Promise.all([
      supabase.from("ai_score_events").select("*").eq("workspace_id", id).order("created_at"),
      supabase.from("ai_analysis_events").select("*").eq("workspace_id", id).order("created_at"),
    ]);

    const summary = computeSummaryMetrics(scoreRes.data || [], analysisRes.data || []);
    return NextResponse.json(summary);
  });
}
