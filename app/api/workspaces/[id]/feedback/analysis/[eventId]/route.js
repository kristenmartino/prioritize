import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../../../lib/api-auth";

export async function PATCH(request, { params }) {
  const { id, eventId } = await params;
  return withAuth(async (userId, supabase) => {
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { thumbs_up } = await request.json();
    if (typeof thumbs_up !== "boolean")
      return NextResponse.json({ error: "thumbs_up boolean required" }, { status: 400 });

    const { error } = await supabase
      .from("ai_analysis_events")
      .update({ thumbs_up })
      .eq("id", eventId)
      .eq("workspace_id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}
