import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../../../lib/api-auth";
import { classifyOutcome } from "../../../../../../../lib/feedback-context";

export async function POST(request, { params }) {
  const { id } = await params;
  return withAuth(async (userId, supabase) => {
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { featureId, finalScores } = await request.json();
    if (!featureId || !finalScores)
      return NextResponse.json({ error: "featureId and finalScores required" }, { status: 400 });

    // Find pending score events for this feature
    const { data: pending } = await supabase
      .from("ai_score_events")
      .select("id, dimension, ai_score")
      .eq("workspace_id", id)
      .eq("feature_id", featureId)
      .eq("outcome", "pending");

    if (!pending || pending.length === 0)
      return NextResponse.json({ resolved: 0 });

    let resolved = 0;
    for (const event of pending) {
      const finalVal = finalScores[event.dimension];
      if (finalVal != null) {
        const outcome = classifyOutcome(event.ai_score, finalVal);
        await supabase.from("ai_score_events")
          .update({ final_score: finalVal, outcome })
          .eq("id", event.id);
        resolved++;
      }
    }

    return NextResponse.json({ resolved });
  });
}
