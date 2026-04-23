const { supabase } = require('../services/supabase');

async function requireOwner(req, res, next) {
  const { data: community } = await supabase.from('communities').select('owner_id').eq('slug', req.params.slug).single();
  if (!community || community.owner_id !== req.user.id) return res.status(403).json({ error: 'Owner access required' });
  return next();
}

module.exports = { requireOwner };
