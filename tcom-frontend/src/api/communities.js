import { api } from './client';
export const communityApi = {
  list: () => api.get('/communities').then((r) => r.data),
  get: (slug) => api.get(`/communities/${slug}`).then((r) => r.data),
  create: (payload) => api.post('/communities', payload).then((r) => r.data),
  update: (slug, payload) => api.patch(`/communities/${slug}`, payload).then((r) => r.data),
  join: (slug) => api.post(`/communities/${slug}/join`).then((r) => r.data),
  leave: (slug) => api.post(`/communities/${slug}/leave`).then((r) => r.data),
  members: (slug) => api.get(`/communities/${slug}/members`).then((r) => r.data),
  setModerator: (slug, payload) => api.put(`/communities/${slug}/moderators`, payload).then((r) => r.data),
};
