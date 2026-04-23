const express = require('express');
const { z } = require('zod');
const { supabase } = require('../services/supabase');
const { authenticate } = require('../middleware/authenticate');
const { optionalAuth } = require('../middleware/optionalAuth');

const router = express.Router();

async function attachLikedByMe(posts, userId) {
  if (!userId || !Array.isArray(posts) || posts.length === 0) {
    for (const p of posts || []) p.liked_by_me = false;
    return posts;
  }
  const ids = posts.map((p) => p.id);
  const { data: likes } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', ids);
  const likedSet = new Set((likes || []).map((l) => l.post_id));
  for (const p of posts) p.liked_by_me = likedSet.has(p.id);
  return posts;
}

router.get('/community/:slug', optionalAuth, async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Community not found' });
  const { data, error } = await supabase
    .from('posts')
    .select('*, users:author_id(username,display_name,avatar_url)')
    .eq('community_id', community.id)
    .is('parent_post_id', null)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) return res.status(400).json({ error: error.message });
  await attachLikedByMe(data, req.user?.id);
  return res.json(data);
});

router.post('/community/:slug', authenticate, async (req, res) => {
  const parsed = z
    .object({
      content: z.string().min(1).max(500),
      media_urls: z.array(z.string().url()).optional().default([]),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Community not found' });
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...parsed.data, community_id: community.id, author_id: req.user.id })
    .select('*, users:author_id(username,display_name,avatar_url)')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  await supabase.rpc('increment_post_count', { community_slug: req.params.slug });
  return res.status(201).json({ ...data, liked_by_me: false });
});

router.get('/:id', optionalAuth, async (req, res) => {
  const { data: post } = await supabase
    .from('posts')
    .select('*, users:author_id(username,display_name,avatar_url)')
    .eq('id', req.params.id)
    .single();
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const { data: replies } = await supabase
    .from('posts')
    .select('*, users:author_id(username,display_name,avatar_url)')
    .eq('parent_post_id', req.params.id)
    .order('created_at', { ascending: true });
  const all = [post, ...(replies || [])];
  await attachLikedByMe(all, req.user?.id);
  return res.json({ ...post, replies: replies || [] });
});

router.post('/:id/reply', authenticate, async (req, res) => {
  const parsed = z.object({ content: z.string().min(1).max(500) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { data: parent } = await supabase.from('posts').select('id,community_id').eq('id', req.params.id).single();
  if (!parent) return res.status(404).json({ error: 'Parent post not found' });
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content: parsed.data.content,
      community_id: parent.community_id,
      parent_post_id: parent.id,
      author_id: req.user.id,
    })
    .select('*, users:author_id(username,display_name,avatar_url)')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  await supabase.rpc('increment_reply_count', { post_uuid: parent.id });
  return res.status(201).json({ ...data, liked_by_me: false });
});

router.post('/:id/like', authenticate, async (req, res) => {
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();
  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id);
    await supabase.rpc('decrement_like_count', { post_uuid: req.params.id });
    return res.json({ liked: false });
  }
  await supabase.from('post_likes').insert({ post_id: req.params.id, user_id: req.user.id });
  await supabase.rpc('increment_like_count', { post_uuid: req.params.id });
  return res.json({ liked: true });
});

router.delete('/:id', authenticate, async (req, res) => {
  const { data: post } = await supabase
    .from('posts')
    .select('id, author_id, community_id, parent_post_id')
    .eq('id', req.params.id)
    .single();
  if (!post) return res.status(404).json({ error: 'Post not found' });

  let isMod = false;
  if (post.author_id !== req.user.id) {
    const { data: membership } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', post.community_id)
      .eq('user_id', req.user.id)
      .maybeSingle();
    isMod = membership && ['owner', 'moderator'].includes(membership.role);
    if (!isMod) return res.status(403).json({ error: 'Not allowed' });
  }

  const { error } = await supabase.from('posts').delete().eq('id', post.id);
  if (error) return res.status(400).json({ error: error.message });

  if (post.parent_post_id) {
    await supabase.rpc('decrement_reply_count', { post_uuid: post.parent_post_id }).catch(() => {});
  }
  return res.status(204).send();
});

module.exports = router;
