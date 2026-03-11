// ─────────────────────────────────────────────
// Desi Quiz AI — Backend Proxy (Vercel Serverless)
// Keeps your Anthropic API key safe on the server.
// ─────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // Allow requests from your frontend only
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle browser preflight
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "Method not allowed" });

  const { categories, difficulty } = req.body || {};
  if (!categories || !difficulty)
    return res.status(400).json({ error: "Missing categories or difficulty" });

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY)
    return res.status(500).json({ error: "API key not configured on server" });

  const prompt = `You are a quiz master for "Desi Quiz" — a fun Indian trivia game.
Generate exactly 10 multiple-choice questions about: ${categories.join(", ")}.
Difficulty: ${difficulty}.
Language: Clear, fun English. Keep it engaging and conversational.
Indian context — questions should feel relevant to Indian players.

RULES:
- 4 answer options per question
- Exactly ONE correct answer
- Include a short fun fact (1–2 sentences) per question
- Questions must be UNIQUE — avoid the most obvious/overused facts
- ${difficulty === "Hard" ? "Ask deep, tricky questions that even experts might struggle with" : difficulty === "Easy" ? "Ask popular, well-known questions anyone familiar with India would know" : "Mix of popular knowledge and moderately challenging questions"}

Respond ONLY with a valid JSON array. No markdown, no explanation, no extra text:
[
  {
    "q": "question text",
    "opts": ["Option A", "Option B", "Option C", "Option D"],
    "ans": 0,
    "cat": "category name",
    "fact": "fun fact about the answer"
  }
]
"ans" is the 0-based index of the correct option.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: "Upstream API error", detail: err });
    }

    const data = await response.json();
    const raw   = (data.content || []).map(c => c.text || "").join("").trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(clean);

    if (!Array.isArray(questions) || questions.length === 0)
      return res.status(500).json({ error: "Invalid questions format from AI" });

    return res.status(200).json({ questions });

  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
