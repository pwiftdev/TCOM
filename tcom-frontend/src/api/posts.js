import { api } from './client';

export const postApi = {
  listByCommunity: (slug) => api.get(`/posts/community/${slug}`).then((r) => r.data),
  createInCommunity: (slug, payload) => api.post(`/posts/community/${slug}`, payload).then((r) => r.data),
  get: (id) => api.get(`/posts/${id}`).then((r) => r.data),
  reply: (id, payload) => api.post(`/posts/${id}/reply`, payload).then((r) => r.data),
  toggleLike: (id) => api.post(`/posts/${id}/like`).then((r) => r.data),
  pin: (id, pinned = true) => api.post(`/posts/${id}/pin`, { pinned }).then((r) => r.data),
  remove: (id) => api.delete(`/posts/${id}`).then((r) => r.data),
  uploadMedia: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/posts/media', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
