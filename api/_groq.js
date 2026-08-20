// Shared Groq client for the serverless functions.
// (Files in api/ starting with "_" are not deployed as functions.)
//
// Groq retires model names over time (llama-3.3-70b-versatile died this way),
// so nothing is hardcoded for long: we try a few known-good names, and if
// they are all gone we ask the Groq API which models this key can actually
// use and pick the best chat model. Override order with GROQ_MODEL.
const DEFAULT_MODELS = [
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama-3.1-8b-instant',
];

// Preference order for discovered models; first match wins.
const PREFERENCES = [
  /llama-4.*maverick/i,
  /llama-4/i,
  /llama.*70b/i,
  /gpt-oss-120b/i,
  /gpt-oss/i,
  /qwen/i,
  /llama/i,
  /instant/i,
];

// Never chat with audio/embedding/safety models.
const NON_CHAT = /whisper|tts|embed|guard|moderation|allam|compound/i;

let discoveredCache = null;

async function discoverModels() {
  if (discoveredCache) return discoveredCache;
  try {
    const r = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    });
    if (!r.ok) return [];
    const data = await r.json();
    const ids = (data.data || []).map((m) => m.id).filter((id) => !NON_CHAT.test(id));
    const ranked = [];
    for (const pref of PREFERENCES) {
      for (const id of ids) {
        if (pref.test(id) && !ranked.includes(id)) ranked.push(id);
      }
    }
    for (const id of ids) if (!ranked.includes(id)) ranked.push(id);
    discoveredCache = ranked;
    return ranked;
  } catch {
    return [];
  }
}

export function candidateModels() {
  return process.env.GROQ_MODEL
    ? [process.env.GROQ_MODEL, ...DEFAULT_MODELS]
    : DEFAULT_MODELS;
}

function isModelGone(status, message) {
  return status === 404 || /model .*(does not exist|decommissioned|deprecated)/i.test(message);
}

// Returns { ok: true, content, model } or { ok: false, status, message }.
export async function callGroq({ systemPrompt, userContent, temperature = 0 }) {
  let lastError = { status: 500, message: 'Groq API error' };
  const tried = new Set();
  let attempts = 0;
  let modelGoneCount = 0;

  const attempt = async (model) => {
    tried.add(model);
    attempts++;
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
        return 'continue';
      }
      return { ok: true, content: raw, model };
    }

    const errBody = await response.json().catch(() => ({}));
    const message = errBody?.error?.message || 'Groq API error';
    lastError = { status: response.status, message };
    if (isModelGone(response.status, message)) {
      modelGoneCount++;
      return 'continue';
    }
    // Auth failures, rate limits etc. would fail for every model — surface them.
    return 'stop';
  };

  for (const model of candidateModels()) {
    const result = await attempt(model);
    if (result === 'stop') return { ok: false, ...lastError };
    if (result !== 'continue') return result;
  }

  // Every hardcoded model was rejected as unknown — ask Groq what exists.
  if (modelGoneCount === attempts) {
    const discovered = (await discoverModels()).filter((m) => !tried.has(m)).slice(0, 3);
    for (const model of discovered) {
      const result = await attempt(model);
      if (result === 'stop') return { ok: false, ...lastError };
      if (result !== 'continue') return result;
    }
  }

  return { ok: false, ...lastError };
}
