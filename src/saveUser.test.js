import { saveUserToFirestore } from './saveUser';
import { getDoc, setDoc } from 'firebase/firestore';

vi.mock('./firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'user-ref'),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('saveUserToFirestore', () => {
  it('creates a new user document with the default "user" role', async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    await saveUserToFirestore({ uid: 'u1', email: 'a@b.com', displayName: 'Ada' });

    expect(setDoc).toHaveBeenCalledTimes(1);
    const written = setDoc.mock.calls[0][1];
    expect(written).toMatchObject({
      uid: 'u1',
      email: 'a@b.com',
      displayName: 'Ada',
      role: 'user',
    });
    expect(written.createdAt).toBeTruthy();
  });

  it('never grants a role other than "user" on signup', async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    await saveUserToFirestore({ uid: 'u1', email: 'a@b.com', role: 'admin' });
    expect(setDoc.mock.calls[0][1].role).toBe('user');
  });

  it('merges profile fields without touching the role for an existing user', async () => {
    getDoc.mockResolvedValue({ exists: () => true });
    await saveUserToFirestore({ uid: 'u1', email: 'a@b.com', displayName: 'Ada' });

    expect(setDoc).toHaveBeenCalledTimes(1);
    const [, written, options] = setDoc.mock.calls[0];
    expect(written).toEqual({ displayName: 'Ada', photoURL: '' });
    expect(options).toEqual({ merge: true });
  });
});
