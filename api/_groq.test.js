import { callGroq } from './_groq.js';

function groqReply(content) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  };
}

function modelGone(model) {
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: { message: `The model \`${model}\` does not exist or you do not have access to it.` } }),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('callGroq model fallback', () => {
  it('uses the first model when it works', async () => {
    const fetchMock = vi.fn(async () => groqReply('{"ok":true}'));
    vi.stubGlobal('fetch', fetchMock);
    const result = await callGroq({ systemPrompt: 's', userContent: 'u' });
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls through retired models to the next candidate', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(modelGone('a'))
      .mockResolvedValueOnce(groqReply('{"ok":true}'));
    vi.stubGlobal('fetch', fetchMock);
    const result = await callGroq({ systemPrompt: 's', userContent: 'u' });
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('discovers live models from the Groq catalog when every hardcoded name is gone', async () => {
    const fetchMock = vi.fn(async (url, opts) => {
      if (String(url).includes('/models')) {
        return { ok: true, json: async () => ({ data: [{ id: 'whisper-large-v3' }, { id: 'llama-9-super' }] }) };
      }
      const model = JSON.parse(opts.body).model;
      if (model === 'llama-9-super') return groqReply('{"ok":true}');
      return modelGone(model);
    });
    vi.stubGlobal('fetch', fetchMock);
    const result = await callGroq({ systemPrompt: 's', userContent: 'u' });
    expect(result.ok).toBe(true);
    expect(result.model).toBe('llama-9-super');
  });

  it('stops immediately on non-model errors like rate limits', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: 'rate limited' } }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await callGroq({ systemPrompt: 's', userContent: 'u' });
    expect(result).toEqual({ ok: false, status: 429, message: 'rate limited' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
