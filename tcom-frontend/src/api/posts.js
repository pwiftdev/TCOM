import { api } from './client';
export const postApi = {
  listByCommunity: (slug) => api.get(`/posts/community/${slug}`).then((r) => r.data),
  createInCommunity: (slug, payload) => api.post(`/posts/community/${slug}`, payload).then((r) => r.data),
  get: (id) => api.get(`/posts/${id}`).then((r) => r.data),
  reply: (id, payload) => api.post(`/posts/${id}/reply`, payload).then((r) => r.data),
  toggleLike: (id) => api.post(`/posts/${id}/like`).then((r) => r.data),
};
