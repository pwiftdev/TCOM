const express = require('express');
const { z } = require('zod');
const { supabase } = require('../services/supabase');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.get('/community/:slug', async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Community not found' });
  const { data, error } = await supabase.from('posts').select('*, users:author_id(username,display_name,avatar_url)').eq('community_id', community.id).is('parent_post_id', null).order('created_at', { ascending: false }).limit(30);
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});
router.post('/community/:slug', authenticate, async (req, res) => {
  const parsed = z.object({ content: z.string().min(1).max(500), media_urls: z.array(z.string().url()).optional().default([]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Community not found' });
  const { data, error } = await supabase.from('posts').insert({ ...parsed.data, community_id: community.id, author_id: req.user.id }).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  await supabase.rpc('increment_post_count', { community_slug: req.params.slug });
  return res.status(201).json(data);
});
router.get('/:id', async (req, res) => {
  const { data: post } = await supabase.from('posts').select('*, users:author_id(username,display_name,avatar_url)').eq('id', req.params.id).single();
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const { data: replies } = await supabase.from('posts').select('*, users:author_id(username,display_name,avatar_url)').eq('parent_post_id', req.params.id).order('created_at', { ascending: true });
  return res.json({ ...post, replies: replies || [] });
});
router.post('/:id/reply', authenticate, async (req, res) => {
  const parsed = z.object({ content: z.string().min(1).max(500) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { data: parent } = await supabase.from('posts').select('id,community_id').eq('id', req.params.id).single();
  if (!parent) return res.status(404).json({ error: 'Parent post not found' });
  const { data, error } = await supabase.from('posts').insert({ content: parsed.data.content, community_id: parent.community_id, parent_post_id: parent.id, author_id: req.user.id }).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  await supabase.rpc('increment_reply_count', { post_uuid: parent.id });
  return res.status(201).json(data);
});
router.post('/:id/like', authenticate, async (req, res) => {
  const { data: existing } = await supabase.from('post_likes').select('id').eq('post_id', req.params.id).eq('user_id', req.user.id).maybeSingle();
  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id);
    await supabase.rpc('decrement_like_count', { post_uuid: req.params.id });
    return res.json({ liked: false });
  }
  await supabase.from('post_likes').insert({ post_id: req.params.id, user_id: req.user.id });
  await supabase.rpc('increment_like_count', { post_uuid: req.params.id });
  return res.json({ liked: true });
});

module.exports = router;
