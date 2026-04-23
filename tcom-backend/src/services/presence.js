const { supabase } = require('./supabase');

// Throttle per-user writes to last_seen_at — one update per user per 60s.
const lastTouched = new Map();
const TOUCH_THROTTLE_MS = 60_000;
const ONLINE_WINDOW_SECONDS = 120;

function touchUser(userId) {
  if (!userId) return;
  const now = Date.now();
  const last = lastTouched.get(userId) || 0;
  if (now - last < TOUCH_THROTTLE_MS) return;
  lastTouched.set(userId, now);
  // Fire and forget — don't block the request on presence updates.
  supabase
    .from('users')
    .update({ last_seen_at: new Date(now).toISOString() })
    .eq('id', userId)
    .then(() => {}, () => {});
}

async function getOnlineCount() {
  const since = new Date(Date.now() - ONLINE_WINDOW_SECONDS * 1000).toISOString();
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .gte('last_seen_at', since);
  return count || 0;
}

module.exports = { touchUser, getOnlineCount, ONLINE_WINDOW_SECONDS };
