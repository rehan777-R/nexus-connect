import { moderateInBackground } from './moderation';
import { updateDoc } from 'firebase/firestore';

vi.mock('../firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'message-ref'),
  updateDoc: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('moderateInBackground', () => {
  it('marks the message as flagged when the AI flags it', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => ({ flagged: true, reason: 'Harassment' }),
    })));
    await moderateInBackground('m1', 'abusive text');
    expect(updateDoc).toHaveBeenCalledWith('message-ref', {
      flagged: true,
      flagReason: 'Harassment',
    });
  });

  it('clears the flag when the AI does not flag it', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => ({ flagged: false }),
    })));
    await moderateInBackground('m1', 'see you at standup');
    expect(updateDoc).toHaveBeenCalledWith('message-ref', {
      flagged: false,
      flagReason: '',
    });
  });

  it('swallows network errors so sending is never blocked', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(moderateInBackground('m1', 'hello')).resolves.toBeUndefined();
    expect(updateDoc).not.toHaveBeenCalled();
  });
});
