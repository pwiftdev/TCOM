const express = require('express');
const { supabase } = require('../services/supabase');

const router = express.Router();

router.get('/:username', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id,username,display_name,avatar_url,bio,followers_count,following_count,created_at')
    .eq('username', req.params.username)
    .single();
  if (error) return res.status(404).json({ error: 'User not found' });
  return res.json(data);
});

router.get('/:username/communities', async (req, res) => {
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('id')
    .eq('username', req.params.username)
    .single();
  if (userErr || !user) return res.status(404).json({ error: 'User not found' });

  const { data, error } = await supabase
    .from('community_members')
    .select('role, joined_at, communities(id,slug,name,description,banner_url,visibility,member_count,post_count,contract_address,pump_fun_link)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });

  const list = (data || [])
    .filter((row) => row.communities)
    .map((row) => ({ ...row.communities, role: row.role, joined_at: row.joined_at }));
  return res.json(list);
});

module.exports = router;
