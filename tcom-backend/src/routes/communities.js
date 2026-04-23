const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const { supabase } = require('../services/supabase');
const { authenticate } = require('../middleware/authenticate');
const { optionalAuth } = require('../middleware/optionalAuth');
const { requireOwner } = require('../middleware/requireOwner');
const { uploadImage } = require('../services/storage');
const { toSlug } = require('../utils/slug');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const schema = z.object({
  name: z.string().min(3).max(80),
  slug: z.string().min(3).max(80).optional(),
  description: z.string().max(5000).optional().default(''),
  visibility: z.enum(['public', 'private', 'invite']).default('public'),
  tags: z.array(z.string()).optional().default([]),
});

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('visibility', 'public')
    .order('member_count', { ascending: false })
    .limit(30);
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.get('/:slug', optionalAuth, async (req, res) => {
  const { data: community, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', req.params.slug)
    .single();
  if (error || !community) return res.status(404).json({ error: 'Community not found' });

  if (community.owner_id) {
    const { data: owner } = await supabase
      .from('users')
      .select('username,display_name,avatar_url')
      .eq('id', community.owner_id)
      .single();
    community.creator = owner || null;
  }

  if (req.user) {
    const { data: membership } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', community.id)
      .eq('user_id', req.user.id)
      .maybeSingle();
    community.is_member = !!membership;
    community.my_role = membership?.role || null;
  } else {
    community.is_member = false;
    community.my_role = null;
  }

  return res.json(community);
});

router.post('/', authenticate, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const input = parsed.data;
  const slug = toSlug(input.slug || input.name);
  const { data: community, error } = await supabase
    .from('communities')
    .insert({ ...input, slug, owner_id: req.user.id, member_count: 1 })
    .select('*')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  await supabase.from('community_members').insert({ community_id: community.id, user_id: req.user.id, role: 'owner' });
  return res.status(201).json(community);
});

router.patch('/:slug', authenticate, requireOwner, async (req, res) => {
  const { data, error } = await supabase.from('communities').update(req.body).eq('slug', req.params.slug).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.delete('/:slug', authenticate, requireOwner, async (req, res) => {
  const { error } = await supabase.from('communities').delete().eq('slug', req.params.slug);
  if (error) return res.status(400).json({ error: error.message });
  return res.status(204).send();
});

router.post('/:slug/join', authenticate, async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Community not found' });
  const { data: existing } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', community.id)
    .eq('user_id', req.user.id)
    .maybeSingle();
  if (existing) return res.json({ ok: true, already: true });
  await supabase.from('community_members').insert({ community_id: community.id, user_id: req.user.id, role: 'member' });
  await supabase.rpc('increment_member_count', { community_slug: req.params.slug });
  return res.json({ ok: true });
});

router.post('/:slug/leave', authenticate, async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id,owner_id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Community not found' });
  if (community.owner_id === req.user.id) return res.status(400).json({ error: 'Owner cannot leave own community' });
  const { data: existing } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', community.id)
    .eq('user_id', req.user.id)
    .maybeSingle();
  if (!existing) return res.json({ ok: true, already: true });
  await supabase.from('community_members').delete().eq('community_id', community.id).eq('user_id', req.user.id);
  await supabase.rpc('decrement_member_count', { community_slug: req.params.slug });
  return res.json({ ok: true });
});

router.get('/:slug/members', async (req, res) => {
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!community) return res.status(404).json({ error: 'Community not found' });
  const { data, error } = await supabase
    .from('community_members')
    .select('role, joined_at, users!community_members_user_id_fkey(username,display_name,avatar_url)')
    .eq('community_id', community.id)
    .order('joined_at', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.put('/:slug/moderators', authenticate, requireOwner, async (req, res) => {
  const payload = z.object({ username: z.string(), action: z.enum(['grant', 'revoke']) }).safeParse(req.body);
  if (!payload.success) return res.status(400).json({ error: payload.error.flatten() });
  const { data: user } = await supabase.from('users').select('id').eq('username', payload.data.username).single();
  const { data: community } = await supabase.from('communities').select('id').eq('slug', req.params.slug).single();
  if (!user || !community) return res.status(404).json({ error: 'User or community missing' });
  const role = payload.data.action === 'grant' ? 'moderator' : 'member';
  const { error } = await supabase.from('community_members').update({ role }).eq('community_id', community.id).eq('user_id', user.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true, role });
});

router.post('/:slug/banner', authenticate, requireOwner, upload.single('banner'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Missing banner file' });
  const banner_url = await uploadImage({ buffer: req.file.buffer, bucket: 'community-banners', path: `${req.params.slug}/banner.webp`, width: 1500, height: 500 });
  await supabase.from('communities').update({ banner_url }).eq('slug', req.params.slug);
  return res.json({ banner_url });
});

router.post('/:slug/icon', authenticate, requireOwner, upload.single('icon'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Missing icon file' });
  const icon_url = await uploadImage({ buffer: req.file.buffer, bucket: 'community-icons', path: `${req.params.slug}/icon.webp`, width: 400, height: 400 });
  await supabase.from('communities').update({ icon_url }).eq('slug', req.params.slug);
  return res.json({ icon_url });
});

module.exports = router;
