const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const crypto = require('crypto');
const { supabase } = require('../services/supabase');
const { authenticate } = require('../middleware/authenticate');
const { optionalAuth } = require('../middleware/optionalAuth');
const { uploadPostMedia } = require('../services/storage');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

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
    .order('is_pinned', { ascending: false })
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
      media_urls: z.array(z.string().url()).max(4).optional().default([]),
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

router.post('/media', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Missing media file' });
  if (!req.file.mimetype?.startsWith('image/')) {
    return res.status(400).json({ error: 'Only image files are supported' });
  }
  const ext = req.file.mimetype.includes('png') ? 'png' : req.file.mimetype.includes('gif') ? 'gif' : 'jpg';
  const path = `${req.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  try {
    const url = await uploadPostMedia({ buffer: req.file.buffer, path });
    return res.status(201).json({ url });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Could not upload media' });
  }
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
  const parsed = z
    .object({
      content: z.string().min(1).max(500),
      media_urls: z.array(z.string().url()).max(4).optional().default([]),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { data: parent } = await supabase.from('posts').select('id,community_id').eq('id', req.params.id).single();
  if (!parent) return res.status(404).json({ error: 'Parent post not found' });
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content: parsed.data.content,
      media_urls: parsed.data.media_urls,
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

router.post('/:id/pin', authenticate, async (req, res) => {
  const parsed = z.object({ pinned: z.boolean().optional().default(true) }).safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: post } = await supabase
    .from('posts')
    .select('id, community_id, parent_post_id')
    .eq('id', req.params.id)
    .single();
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.parent_post_id) return res.status(400).json({ error: 'Replies cannot be pinned' });

  const { data: community } = await supabase
    .from('communities')
    .select('id, owner_id')
    .eq('id', post.community_id)
    .single();
  if (!community) return res.status(404).json({ error: 'Community not found' });
  if (community.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Only community owner can pin posts' });
  }

  if (parsed.data.pinned) {
    await supabase.from('posts').update({ is_pinned: false }).eq('community_id', community.id).is('parent_post_id', null);
    await supabase.from('posts').update({ is_pinned: true }).eq('id', post.id);
  } else {
    await supabase.from('posts').update({ is_pinned: false }).eq('id', post.id);
  }

  return res.json({ ok: true, pinned: parsed.data.pinned });
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
