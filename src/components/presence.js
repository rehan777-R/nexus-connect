// A user counts as online if their lastSeen heartbeat is recent.
// The heartbeat is written from AuthContext every 45s while the app is open.
const ONLINE_THRESHOLD_MS = 90 * 1000;

export function isOnline(user) {
  if (!user?.lastSeen) return false;
  return Date.now() - new Date(user.lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}
