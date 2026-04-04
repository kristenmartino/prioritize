import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../lib/api-auth";

// GET /api/workspaces/[id]/features — list features
export async function GET(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .eq("workspace_id", id)
      .order("position");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const features = (data || []).map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      reach: r.reach,
      impact: r.impact,
      confidence: r.confidence,
      effort: r.effort,
    }));
    const manualOrder = (data || []).map((r) => r.id);
    return NextResponse.json({ features, manualOrder });
  });
}

// POST /api/workspaces/[id]/features — create or upsert a feature
export async function POST(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const feature = await request.json();
    const { data: existing } = await supabase
      .from("features")
      .select("position")
      .eq("workspace_id", id)
      .order("position", { ascending: false })
      .limit(1);
    const nextPos = existing?.[0] ? existing[0].position + 1 : 0;

    if (feature.id) {
      // Upsert: check if it exists in this workspace
      const { data: found } = await supabase
        .from("features")
        .select("id")
        .eq("id", feature.id)
        .eq("workspace_id", id)
        .single();
      if (found) {
        const { error } = await supabase
          .from("features")
          .update({
            name: feature.name,
            description: feature.description || "",
            reach: feature.reach,
            impact: feature.impact,
            confidence: feature.confidence,
            effort: feature.effort,
          })
          .eq("id", feature.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ id: feature.id });
      }
    }

    // Insert new
    const { data, error } = await supabase
      .from("features")
      .insert({
        workspace_id: id,
        name: feature.name,
        description: feature.description || "",
        reach: feature.reach ?? 50,
        impact: feature.impact ?? 50,
        confidence: feature.confidence ?? 50,
        effort: feature.effort ?? 50,
        position: nextPos,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id }, { status: 201 });
  });
}

// PUT /api/workspaces/[id]/features — bulk update positions (manual order)
export async function PUT(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds))
      return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
    const updates = orderedIds.map((featureId, i) =>
      supabase.from("features").update({ position: i }).eq("id", featureId).eq("workspace_id", id)
    );
    await Promise.all(updates);
    return NextResponse.json({ ok: true });
  });
}
