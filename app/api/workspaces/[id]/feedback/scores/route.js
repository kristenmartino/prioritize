import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../../lib/api-auth";

export async function POST(request, { params }) {
  const { id } = await params;
  return withAuth(async (userId, supabase) => {
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { events } = await request.json();
    if (!Array.isArray(events) || events.length === 0)
      return NextResponse.json({ error: "Events required" }, { status: 400 });

    const rows = events.map(e => ({
      workspace_id: id,
      feature_id: e.feature_id,
      feature_name: e.feature_name,
      dimension: e.dimension,
      ai_score: e.ai_score,
      outcome: "pending",
    }));

    const { data, error } = await supabase.from("ai_score_events").insert(rows).select("id, dimension");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ events: data });
  });
}

export async function GET(request, { params }) {
  const { id } = await params;
  return withAuth(async (userId, supabase) => {
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("ai_score_events")
      .select("*")
      .eq("workspace_id", id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ events: data });
  });
}
