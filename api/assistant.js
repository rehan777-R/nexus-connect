const BREAKDOWN_PROMPT = `You are a project planning assistant for a team task manager.
The user gives you a goal. Break it into 3-6 small, concrete, actionable tasks.

Return ONLY a JSON object with this exact shape, no other text:
{
  "tasks": [
    { "title": string, "description": string, "priority": "Low" | "Medium" | "High" }
  ]
}

Titles must be short (under 60 chars). Descriptions are 1-2 sentences.
Assign priority based on how critical each task is to the goal.`;

const SUMMARY_PROMPT = `You are a productivity assistant for a team task manager.
The user gives you their current task list as JSON. Write a short, helpful summary:
what's on their plate, what's most urgent (overdue or high priority first), and
one concrete suggestion for what to tackle next.

Return ONLY a JSON object with this exact shape, no other text:
{ "summary": string }

Keep the summary under 120 words. Plain text, no markdown.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode, goal, tasks } = req.body || {};

  let systemPrompt, userContent;
  if (mode === 'breakdown') {
    if (!goal || !goal.trim()) return res.status(400).json({ error: 'Missing goal' });
    systemPrompt = BREAKDOWN_PROMPT;
    userContent = goal.trim().slice(0, 500);
  } else if (mode === 'summary') {
    if (!Array.isArray(tasks) || tasks.length === 0) return res.status(400).json({ error: 'Missing tasks' });
    systemPrompt = SUMMARY_PROMPT;
    userContent = JSON.stringify(
      tasks.slice(0, 50).map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate || null,
      }))
    );
  } else {
    return res.status(400).json({ error: 'Invalid mode' });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
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
