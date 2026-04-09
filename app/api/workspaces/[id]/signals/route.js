import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../lib/api-auth";

export async function GET(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const theme = url.searchParams.get("theme");
    const candidateId = url.searchParams.get("candidate_id");

    let query = supabase
      .from("signals")
      .select("*")
      .eq("workspace_id", id)
      .order("created_at", { ascending: false });

    if (type) query = query.eq("type", type);
    if (theme) query = query.eq("theme", theme);
    if (candidateId) query = query.eq("linked_candidate_id", candidateId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ signals: data || [] });
  });
}

export async function POST(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();

    const { data: existing } = await supabase
      .from("signals")
      .select("position")
      .eq("workspace_id", id)
      .order("position", { ascending: false })
      .limit(1);
    const nextPos = existing?.[0] ? existing[0].position + 1 : 0;

    const { data, error } = await supabase
      .from("signals")
      .insert({
        workspace_id: id,
        type: body.type || "note",
        title: body.title,
        body: body.body || "",
        source: body.source || "",
        tags: body.tags || [],
        linked_candidate_id: body.linked_candidate_id || null,
        linked_candidate_name: body.linked_candidate_name || "",
        theme: body.theme || "",
        confidence_impact: body.confidence_impact || "",
        position: nextPos,
      })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  });
}
