export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  try {
    const { features } = req.body;
    if (!features || features.length < 2) return res.status(400).json({ error: "Minimum 2 features required" });

    const prompt = `You are a senior product strategist. Analyze this product backlog and provide actionable prioritization insights.

Features (sorted by RICE score):
${features.map((f, i) => `${i + 1}. "${f.name}" — Reach:${f.reach} Impact:${f.impact} Confidence:${f.confidence} Effort:${f.effort} → RICE:${f.score}
   Description: ${f.description || "No description"}`).join("\n")}

Respond ONLY with a JSON object (no markdown, no backticks). Structure:
{
  "summary": "2-sentence executive summary of the backlog health",
  "topPick": { "name": "feature name", "reason": "1-sentence why to build first" },
  "riskFlag": { "name": "feature name", "reason": "1-sentence risk concern" },
  "quickWin": { "name": "feature name", "reason": "1-sentence why this is a quick win" },
  "sprintPlan": ["feature 1 name", "feature 2 name", "feature 3 name"],
  "insight": "1 non-obvious strategic observation about this backlog"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((c) => c.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(clean);

    return res.status(200).json(analysis);
  } catch (err) {
    console.error("Analysis error:", err);
    return res.status(500).json({ error: "Analysis failed" });
  }
}
