import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../lib/api-auth";

export async function GET(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("workspace_id", id)
      .order("position");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ scenarios: data || [] });
  });
}

export async function POST(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();

    const { data: existing } = await supabase
      .from("scenarios")
      .select("position")
      .eq("workspace_id", id)
      .order("position", { ascending: false })
      .limit(1);
    const nextPos = existing?.[0] ? existing[0].position + 1 : 0;

    const { data, error } = await supabase
      .from("scenarios")
      .insert({
        workspace_id: id,
        name: body.name,
        description: body.description || "",
        weight_reach: body.weight_reach ?? 1.0,
        weight_impact: body.weight_impact ?? 1.0,
        weight_confidence: body.weight_confidence ?? 1.0,
        weight_effort: body.weight_effort ?? 1.0,
        position: nextPos,
      })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  });
}
