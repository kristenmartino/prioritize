import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../lib/api-auth";

// GET /api/workspaces/[id]/settings
export async function GET(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { data, error } = await supabase
      .from("workspaces")
      .select("view_mode, sort_mode, map_color_by, map_size_by, map_label_mode")
      .eq("id", id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      viewMode: data.view_mode || "list",
      sortMode: data.sort_mode || "rice",
      mapColorBy: data.map_color_by || "tier",
      mapSizeBy: data.map_size_by || "uniform",
      mapLabelMode: data.map_label_mode || "hover",
    });
  });
}

// PUT /api/workspaces/[id]/settings
export async function PUT(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { viewMode, sortMode, mapColorBy, mapSizeBy, mapLabelMode } = await request.json();
    const { error } = await supabase
      .from("workspaces")
      .update({
        view_mode: viewMode || "list",
        sort_mode: sortMode || "rice",
        map_color_by: mapColorBy || "tier",
        map_size_by: mapSizeBy || "uniform",
        map_label_mode: mapLabelMode || "hover",
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}
