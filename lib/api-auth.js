import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabase } from "./supabase";

export async function withAuth(handler) {
  const { userId } = await auth();
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
