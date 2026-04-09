import { NextResponse } from "next/server";
import { withAuth, verifyWorkspaceOwner } from "../../../../../../lib/api-auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUuidOrNull = (v) => (v && UUID_RE.test(v) ? v : null);

export async function POST(request, { params }) {
  return withAuth(async (userId, supabase) => {
    const { id } = await params;
    if (!(await verifyWorkspaceOwner(supabase, id, userId)))
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { signals } = await request.json();
    if (!Array.isArray(signals) || signals.length === 0)
      return NextResponse.json({ error: "Signals array required" }, { status: 400 });

    const { data: existing } = await supabase
      .from("signals")
      .select("position")
      .eq("workspace_id", id)
      .order("position", { ascending: false })
      .limit(1);
    let nextPos = existing?.[0] ? existing[0].position + 1 : 0;

    const rows = signals.map((s, i) => ({
      workspace_id: id,
      type: s.type || "import",
      title: s.title || "Untitled",
      body: s.body || "",
      source: s.source || "CSV Import",
      tags: s.tags || [],
      linked_candidate_id: toUuidOrNull(s.linked_candidate_id),
      linked_candidate_name: s.linked_candidate_name || "",
      theme: s.theme || "",
      confidence_impact: s.confidence_impact || "",
      position: nextPos + i,
    }));

    const { data, error } = await supabase
      .from("signals")
      .insert(rows)
      .select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ imported: data.length, signals: data });
  });
}
