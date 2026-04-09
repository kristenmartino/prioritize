import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../lib/api-auth";

// GET /api/workspaces/[id]/context
export async function GET(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { data, error } = await supabase
      .from("workspaces")
      .select("product_summary, target_users, strategic_priorities, constraints, assumptions, success_metrics")
      .eq("id", id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      productSummary: data.product_summary || "",
      targetUsers: data.target_users || "",
      strategicPriorities: data.strategic_priorities || "",
      constraints: data.constraints || "",
      assumptions: data.assumptions || "",
      successMetrics: data.success_metrics || "",
    });
  });
}

// PUT /api/workspaces/[id]/context
export async function PUT(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { productSummary, targetUsers, strategicPriorities, constraints, assumptions, successMetrics } = await request.json();
    const { error } = await supabase
      .from("workspaces")
      .update({
        product_summary: productSummary || "",
        target_users: targetUsers || "",
        strategic_priorities: strategicPriorities || "",
        constraints: constraints || "",
        assumptions: assumptions || "",
        success_metrics: successMetrics || "",
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}
