import { callGroq } from './_groq.js';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing text' });
  }

  try {
    const result = await callGroq({ systemPrompt: SYSTEM_PROMPT, userContent: text, temperature: 0 });
    if (!result.ok) {
      return res.status(result.status).json({ error: result.message });
    }
    return res.status(200).json(JSON.parse(result.content));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
