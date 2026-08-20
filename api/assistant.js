import { callGroq } from './_groq.js';

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
    const result = await callGroq({ systemPrompt, userContent, temperature: 0.4 });
    if (!result.ok) {
      return res.status(result.status).json({ error: result.message });
    }
    return res.status(200).json(JSON.parse(result.content));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
