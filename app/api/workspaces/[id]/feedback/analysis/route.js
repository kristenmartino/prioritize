import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../../lib/api-auth";

export async function POST(request, { params }) {
  const { id } = await params;
  return withAuth(async (userId, supabase) => {
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const row = {
      workspace_id: id,
      feature_count: body.feature_count || 0,
      mode: body.mode || "live",
      response_ms: body.response_ms || null,
      top_pick: body.top_pick || null,
      quick_win: body.quick_win || null,
      risk_flag: body.risk_flag || null,
      error: body.error || false,
    };

    const { data, error } = await supabase.from("ai_analysis_events").insert(row).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ id: data.id });
  });
}
