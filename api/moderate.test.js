import handler from './moderate';

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

function groqReply(content) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/moderate', () => {
  it('rejects non-POST requests', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('rejects empty text', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { text: '   ' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns the model verdict for a clean message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      groqReply(JSON.stringify({ flagged: false, reason: '' }))
    ));
    const res = mockRes();
    await handler({ method: 'POST', body: { text: 'lunch at noon?' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ flagged: false, reason: '' });
  });

  it('returns the model verdict for a flagged message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      groqReply(JSON.stringify({ flagged: true, reason: 'Harassment' }))
    ));
    const res = mockRes();
    await handler({ method: 'POST', body: { text: 'abusive text' } }, res);
    expect(res.json).toHaveBeenCalledWith({ flagged: true, reason: 'Harassment' });
  });

  it('propagates upstream API errors with their status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: 'rate limited' } }),
    })));
    const res = mockRes();
    await handler({ method: 'POST', body: { text: 'hello' } }, res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'rate limited' });
  });

  it('returns 500 when the model reply is empty', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ choices: [] }),
    })));
    const res = mockRes();
    await handler({ method: 'POST', body: { text: 'hello' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
