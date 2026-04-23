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
  getVoiceRoom: (slug) => api.get(`/communities/${slug}/voice`).then((r) => r.data),
  startVoiceRoom: (slug, payload = {}) => api.post(`/communities/${slug}/voice/start`, payload).then((r) => r.data),
  endVoiceRoom: (slug, roomId) => api.post(`/communities/${slug}/voice/${roomId}/end`).then((r) => r.data),
  uploadBanner: (slug, file) => {
    const form = new FormData();
    form.append('banner', file);
    return api.post(`/communities/${slug}/banner`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
