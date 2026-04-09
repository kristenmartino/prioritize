import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../../lib/api-auth";

export async function PATCH(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id, signalId } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updates = await request.json();
    const allowed = [
      "title", "body", "source", "type", "tags",
      "linked_candidate_id", "linked_candidate_name",
      "theme", "confidence_impact",
    ];
    const clean = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    );
    clean.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("signals")
      .update(clean)
      .eq("id", signalId)
      .eq("workspace_id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  });
}

export async function DELETE(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id, signalId } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { error } = await supabase
      .from("signals")
      .delete()
      .eq("id", signalId)
      .eq("workspace_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}
