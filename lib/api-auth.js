import { NextResponse } from "next/server";
import { getSupabase } from "./supabase";

export async function withAuth(handler) {
  let userId = null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const result = await auth();
    userId = result.userId;
  } catch {}
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  return handler(userId, supabase);
}

export async function verifyWorkspaceOwner(supabase, workspaceId, userId) {
  const { data } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("user_id", userId)
    .single();
  return !!data;
}
