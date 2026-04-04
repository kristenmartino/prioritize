import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../lib/api-auth";

// PATCH /api/workspaces/[id] — rename workspace
export async function PATCH(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { name } = await request.json();
    const { error } = await supabase
      .from("workspaces")
      .update({ name })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}

// DELETE /api/workspaces/[id] — delete workspace (cascades to features)
export async function DELETE(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { error } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}
