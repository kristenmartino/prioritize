import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../../lib/api-auth";

// PATCH /api/workspaces/[id]/features/[featureId] — update feature
export async function PATCH(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id, featureId } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updates = await request.json();
    const allowed = ["name", "description", "reach", "impact", "confidence", "effort"];
    const clean = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    );
    const { error } = await supabase
      .from("features")
      .update(clean)
      .eq("id", featureId)
      .eq("workspace_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}

// DELETE /api/workspaces/[id]/features/[featureId] — delete feature
export async function DELETE(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id, featureId } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { error } = await supabase
      .from("features")
      .delete()
      .eq("id", featureId)
      .eq("workspace_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}
