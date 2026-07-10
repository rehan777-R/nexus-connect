export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing text' });
  }

  const SYSTEM_PROMPT = `You are a content moderation classifier for a workplace team chat app.
Analyze the message and decide if it should be flagged for human review.

Flag messages that contain: harassment, hate speech, threats, explicit sexual content,
spam/scam links, or severe profanity directed at a person.
Do NOT flag: normal work discussion, mild frustration, casual language, or friendly banter.

Return ONLY a JSON object with these exact keys, no other text:
{
  "flagged": boolean,
  "reason": string
}

If not flagged, set "reason" to an empty string.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errBody?.error?.message || 'Groq API error' });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return res.status(500).json({ error: 'Empty response from model' });

    return res.status(200).json(JSON.parse(raw));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
