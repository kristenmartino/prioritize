import { NextResponse } from "next/server";
import { withAuth } from "../../../lib/api-auth";

// GET /api/workspaces — list user's workspaces
export async function GET() {
  return withAuth(async (userId, supabase) => {
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, position")
      .eq("user_id", userId)
      .order("position");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  });
}

// POST /api/workspaces — create workspace
export async function POST(request) {
  return withAuth(async (userId, supabase) => {
    const { name } = await request.json();
    const { data: existing } = await supabase
      .from("workspaces")
      .select("position")
      .eq("user_id", userId)
      .order("position", { ascending: false })
      .limit(1);
    const nextPos = existing?.[0] ? existing[0].position + 1 : 0;
    const { data, error } = await supabase
      .from("workspaces")
      .insert({ user_id: userId, name: name || "My Backlog", position: nextPos })
      .select("id, name, position")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  });
}
