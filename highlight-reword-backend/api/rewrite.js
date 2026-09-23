export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server credential is not configured." });
    return;
  }

  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  const style = typeof req.body?.style === "string" ? req.body.style.trim() : "Clearer";

  if (!text) {
    res.status(400).json({ error: "No text supplied." });
    return;
  }
  if (text.length > 12000) {
    res.status(413).json({ error: "Selected text is too long." });
    return;
  }

  const instructions = [
    "You are a rewriting tool.",
    "Return ONLY the rewritten text.",
    "Do not add quotes, headings, explanations, or markdown.",
    "Preserve names, numbers, dates, and factual meaning unless correction is clearly required."
  ].join(" ");

  const promptMap = {
    "Professional": "Rewrite the text professionally and naturally.",
    "Friendly": "Rewrite the text to sound warm, friendly, and natural.",
    "Shorter": "Rewrite the text more concisely while preserving the meaning.",
    "Fix Grammar": "Correct grammar, spelling, punctuation, and awkward wording while preserving meaning and tone.",
    "Clearer": "Rewrite the text so it is clearer, easier to understand, and natural.",
    "Casual": "Rewrite the text in a casual, conversational tone.",
    "Stronger": "Rewrite the text to sound more confident and direct without being rude."
  };

  const rewriteInstruction = promptMap[style] || style;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        store: false,
        max_output_tokens: 800,
        instructions,
        input: `Rewrite instruction: ${rewriteInstruction}\n\nText:\n${text}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.error?.message || "OpenAI request failed.";
      res.status(502).json({ error: msg });
      return;
    }

    let out = "";
    for (const item of data.output || []) {
      for (const part of item.content || []) {
        if (part.type === "output_text" && typeof part.text === "string") {
          out += part.text;
        }
      }
    }

    out = out.trim();
    if (!out) {
      res.status(502).json({ error: "No rewritten text was returned." });
      return;
    }

    res.status(200).json({ text: out });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error." });
  }
}
