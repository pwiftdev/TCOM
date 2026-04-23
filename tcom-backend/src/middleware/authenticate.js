const { verifyToken } = require('../utils/jwt');
const { supabase } = require('../services/supabase');
const { touchUser } = require('../services/presence');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing bearer token' });
  try {
    const payload = verifyToken(header.slice(7));
    const { data: user } = await supabase.from('users').select('*').eq('id', payload.userId).single();
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    touchUser(user.id);
    return next();
  } catch (_err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate };
