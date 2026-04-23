import { api } from './client';
import { supabase } from '../lib/supabase';

const postMediaBucket = 'post-media';

function fileExt(name = '') {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg';
}

async function uploadMediaToSupabase(file) {
  if (!supabase) {
    throw new Error('Missing Supabase config in frontend env');
  }
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Only image files are supported');
  }
  const safeExt = fileExt(file.name);
  const uuid = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  const path = `posts/${Date.now()}-${uuid}.${safeExt}`;

  const { error } = await supabase.storage.from(postMediaBucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(postMediaBucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Could not resolve uploaded media URL');
  return { url: data.publicUrl };
}

export const postApi = {
  listByCommunity: (slug) => api.get(`/posts/community/${slug}`).then((r) => r.data),
  createInCommunity: (slug, payload) => api.post(`/posts/community/${slug}`, payload).then((r) => r.data),
  get: (id) => api.get(`/posts/${id}`).then((r) => r.data),
  reply: (id, payload) => api.post(`/posts/${id}/reply`, payload).then((r) => r.data),
  toggleLike: (id) => api.post(`/posts/${id}/like`).then((r) => r.data),
  pin: (id, pinned = true) => api.post(`/posts/${id}/pin`, { pinned }).then((r) => r.data),
  remove: (id) => api.delete(`/posts/${id}`).then((r) => r.data),
  uploadMedia: (file) => uploadMediaToSupabase(file),
};
