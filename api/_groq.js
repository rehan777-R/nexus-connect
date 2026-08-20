// Shared Groq client for the serverless functions.
// (Files in api/ starting with "_" are not deployed as functions.)
//
// Groq retires model names over time (llama-3.3-70b-versatile died this way),
// so instead of hardcoding one model we try candidates in order and fall
// through on "model does not exist" errors. Override with GROQ_MODEL.
const DEFAULT_MODELS = [
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama-3.1-8b-instant',
];

export function candidateModels() {
  return process.env.GROQ_MODEL
    ? [process.env.GROQ_MODEL, ...DEFAULT_MODELS]
    : DEFAULT_MODELS;
}

// Returns { ok: true, content, model } or { ok: false, status, message }.
export async function callGroq({ systemPrompt, userContent, temperature = 0 }) {
  let lastError = { status: 500, message: 'Groq API error' };

  for (const model of candidateModels()) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) {
        lastError = { status: 500, message: 'Empty response from model' };
        continue;
      }
      return { ok: true, content: raw, model };
    }

    const errBody = await response.json().catch(() => ({}));
    const message = errBody?.error?.message || 'Groq API error';
    lastError = { status: response.status, message };

    // Only fall through to the next candidate when THIS model is the problem.
    // Auth failures, rate limits etc. would fail for every model — surface them.
    const modelGone =
      response.status === 404 || /model .*(does not exist|decommissioned|deprecated)/i.test(message);
    if (!modelGone) break;
  }

  return { ok: false, ...lastError };
}
