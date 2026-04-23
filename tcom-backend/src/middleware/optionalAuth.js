const { verifyToken } = require('../utils/jwt');
const { supabase } = require('../services/supabase');
const { touchUser } = require('../services/presence');

async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const payload = verifyToken(header.slice(7));
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();
    if (user) {
      req.user = user;
      touchUser(user.id);
    }
  } catch (_err) {
    // ignore invalid tokens — request continues unauthenticated
  }
  return next();
}

module.exports = { optionalAuth };
