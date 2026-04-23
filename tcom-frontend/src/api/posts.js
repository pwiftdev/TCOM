import { api } from './client';
import { supabase } from '../lib/supabase';
import { DESIGN_PREVIEW, designData } from '../lib/designPreview';

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
  listByCommunity: (slug, { sort = 'latest' } = {}) =>
    (DESIGN_PREVIEW ? designData.postsList(slug, sort) : api.get(`/posts/community/${slug}`, { params: { sort } }).then((r) => r.data)),
  createInCommunity: (slug, payload) => (DESIGN_PREVIEW ? designData.postCreate(slug, payload) : api.post(`/posts/community/${slug}`, payload).then((r) => r.data)),
  get: (id) => (DESIGN_PREVIEW ? designData.postGet(id) : api.get(`/posts/${id}`).then((r) => r.data)),
  reply: (id, payload) => (DESIGN_PREVIEW ? designData.postReply(id, payload) : api.post(`/posts/${id}/reply`, payload).then((r) => r.data)),
  toggleLike: (id) => (DESIGN_PREVIEW ? designData.postLike(id) : api.post(`/posts/${id}/like`).then((r) => r.data)),
  pin: (id, pinned = true) => (DESIGN_PREVIEW ? designData.postPin(id, pinned) : api.post(`/posts/${id}/pin`, { pinned }).then((r) => r.data)),
  remove: (id) => (DESIGN_PREVIEW ? designData.postDelete(id) : api.delete(`/posts/${id}`).then((r) => r.data)),
  view: (id) => (DESIGN_PREVIEW ? designData.postView(id) : api.post(`/posts/${id}/view`).then((r) => r.data)),
  uploadMedia: (file) => (DESIGN_PREVIEW ? Promise.resolve({ url: URL.createObjectURL(file) }) : uploadMediaToSupabase(file)),
};
