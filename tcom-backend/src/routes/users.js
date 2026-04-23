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

module.exports = router;
