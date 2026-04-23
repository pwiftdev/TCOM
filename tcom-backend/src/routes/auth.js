const express = require('express');
const crypto = require('crypto');
const { supabase } = require('../services/supabase');
const { signToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/authenticate');
const { exchangeCodeForToken, fetchProfile } = require('../services/xApi');
const env = require('../config/env');

const router = express.Router();

router.get('/x', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  req.session.oauthState = state;
  req.session.codeVerifier = codeVerifier;

  const url = new URL('https://twitter.com/i/oauth2/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', env.xClientId);
  url.searchParams.set('redirect_uri', env.xCallbackUrl);
  url.searchParams.set('scope', 'tweet.read users.read offline.access');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');

  res.redirect(url.toString());
});

router.get('/x/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || state !== req.session.oauthState) return res.status(403).send('Invalid auth state');

  const tokenData = await exchangeCodeForToken({ code, clientId: env.xClientId, clientSecret: env.xClientSecret, redirectUri: env.xCallbackUrl, codeVerifier: req.session.codeVerifier });
  const xUser = await fetchProfile(tokenData.access_token);

  const payload = {
    x_id: xUser.id,
    username: xUser.username,
    display_name: xUser.name,
    bio: xUser.description || '',
    avatar_url: xUser.profile_image_url?.replace('_normal', '_400x400') || null,
    followers_count: xUser.public_metrics?.followers_count || 0,
    following_count: xUser.public_metrics?.following_count || 0,
    x_access_token: tokenData.access_token,
    x_refresh_token: tokenData.refresh_token,
    last_x_sync: new Date().toISOString()
  };

  const { data: user, error } = await supabase.from('users').upsert(payload, { onConflict: 'x_id' }).select('*').single();
  if (error) return res.status(500).json({ error: error.message });

  const token = signToken(user.id);
  res.redirect(`${env.frontendUrl}/auth/callback?token=${token}`);
});

router.get('/me', authenticate, async (req, res) => res.json(req.user));

router.post('/refresh-profile', authenticate, async (req, res) => {
  const xUser = await fetchProfile(req.user.x_access_token);
  const { data, error } = await supabase.from('users').update({
    display_name: xUser.name,
    bio: xUser.description || '',
    avatar_url: xUser.profile_image_url?.replace('_normal', '_400x400') || null,
    followers_count: xUser.public_metrics?.followers_count || 0,
    following_count: xUser.public_metrics?.following_count || 0,
    last_x_sync: new Date().toISOString()
  }).eq('id', req.user.id).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.post('/logout', (_req, res) => res.json({ ok: true }));

module.exports = router;
