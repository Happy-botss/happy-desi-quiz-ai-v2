// ─────────────────────────────────────────────
// Desi Quiz AI — Backend Proxy (Vercel Serverless)
// Keeps your Anthropic API key safe on the server.
// ─────────────────────────────────────────────


const https = require("https");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { categories, difficulty } = req.body || {};
  if (!categories || !difficulty)
    return res.status(400).json({ error: "Missing fields" });

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY)
    return res.status(500).json({ error: "API key not set in Vercel environment variables" });

  const prompt = `You are a quiz master for "Desi Quiz" — a fun Indian trivia game.
Generate exactly 10 multiple-choice questions about: ${categories.join(", ")}.
Difficulty: ${difficulty}.
Language: Clear fun English. Indian context.

RULES:
- 4 options per question, exactly ONE correct answer
- Include a short fun fact per question
- Questions must be unique and interesting
- ${difficulty === "Hard" ? "Ask deep tricky questions" : difficulty === "Easy" ? "Ask popular well-known questions" : "Mix easy and medium questions"}

Respond ONLY with a valid JSON array, zero extra text:
[{"q":"question","opts":["A","B","C","D"],"ans":0,"cat":"category","fact":"fun fact"}]
ans = 0-based index of correct answer.`;

  const body = JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }]
  });

  try {
    const data = await new Promise((resolve, reject) => {
      const request = https.request({
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Length": Buffer.byteLength(body)
        }
      }, (response) => {
        let raw = "";
        response.on("data", chunk => raw += chunk);
        response.on("end", () => {
          try { resolve(JSON.parse(raw)); }
          catch (e) { reject(new Error("Bad response from Anthropic: " + raw.substring(0, 100))); }
        });
      });
      request.on("error", reject);
      request.write(body);
      request.end();
    });

    const text = (data.content || []).map(c => c.text || "").join("").trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(clean);

    if (!Array.isArray(questions) || questions.length === 0)
      return res.status(500).json({ error: "AI returned invalid format" });

    return res.status(200).json({ questions });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
