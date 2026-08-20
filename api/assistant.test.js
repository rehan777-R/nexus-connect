import handler from './assistant';

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

describe('POST /api/assistant', () => {
  it('rejects non-POST requests', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('rejects an unknown mode', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { mode: 'nonsense' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid mode' });
  });

  it('requires a goal in breakdown mode', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { mode: 'breakdown', goal: '  ' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('requires a non-empty task list in summary mode', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { mode: 'summary', tasks: [] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns generated tasks for a goal breakdown', async () => {
    const tasks = [{ title: 'Draft outline', description: 'Write it.', priority: 'High' }];
    vi.stubGlobal('fetch', vi.fn(async () => groqReply(JSON.stringify({ tasks }))));
    const res = mockRes();
    await handler({ method: 'POST', body: { mode: 'breakdown', goal: 'Launch the blog' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ tasks });
  });

  it('sends only the fields the model needs, capped at 50 tasks', async () => {
    const fetchMock = vi.fn(async () => groqReply(JSON.stringify({ summary: 'ok' })));
    vi.stubGlobal('fetch', fetchMock);
    const tasks = Array.from({ length: 60 }, (_, i) => ({
      title: `Task ${i}`,
      status: 'To Do',
      priority: 'Low',
      description: 'should be stripped',
      createdByEmail: 'should-not-leak@example.com',
    }));
    const res = mockRes();
    await handler({ method: 'POST', body: { mode: 'summary', tasks } }, res);

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    const sent = JSON.parse(payload.messages[1].content);
    expect(sent).toHaveLength(50);
    expect(sent[0]).toEqual({ title: 'Task 0', status: 'To Do', priority: 'Low', dueDate: null });
    expect(payload.messages[1].content).not.toContain('should-not-leak');
  });

  it('propagates upstream API errors with their status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    })));
    const res = mockRes();
    await handler({ method: 'POST', body: { mode: 'breakdown', goal: 'x' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Groq API error' });
  });
});
