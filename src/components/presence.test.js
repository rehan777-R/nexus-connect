import { isOnline } from './presence';

describe('isOnline', () => {
  it('is false for a missing user or one without a heartbeat', () => {
    expect(isOnline(null)).toBe(false);
    expect(isOnline(undefined)).toBe(false);
    expect(isOnline({})).toBe(false);
  });

  it('is true when the last heartbeat is recent', () => {
    const lastSeen = new Date(Date.now() - 30 * 1000).toISOString();
    expect(isOnline({ lastSeen })).toBe(true);
  });

  it('is false when the last heartbeat is older than the threshold', () => {
    const lastSeen = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(isOnline({ lastSeen })).toBe(false);
  });
});
