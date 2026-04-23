import { api } from './client';
import { DESIGN_PREVIEW, designData } from '../lib/designPreview';
export const communityApi = {
  list: () => (DESIGN_PREVIEW ? designData.communitiesList() : api.get('/communities').then((r) => r.data)),
  get: (slug) => (DESIGN_PREVIEW ? designData.communitiesGet(slug) : api.get(`/communities/${slug}`).then((r) => r.data)),
  create: (payload) => (DESIGN_PREVIEW
    ? Promise.resolve({
      id: `comm-${Date.now()}`,
      slug: (payload?.name || 'new-community').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      ...payload,
      member_count: 1,
      post_count: 0,
      is_member: true,
      my_role: 'owner',
    })
    : api.post('/communities', payload).then((r) => r.data)),
  update: (slug, payload) => (DESIGN_PREVIEW ? Promise.resolve({ slug, ...payload }) : api.patch(`/communities/${slug}`, payload).then((r) => r.data)),
  remove: (slug) => (DESIGN_PREVIEW ? Promise.resolve({ ok: true, slug }) : api.delete(`/communities/${slug}`).then((r) => r.data)),
  join: (slug) => (DESIGN_PREVIEW ? designData.communityJoin(slug) : api.post(`/communities/${slug}/join`).then((r) => r.data)),
  leave: (slug) => (DESIGN_PREVIEW ? designData.communityLeave(slug) : api.post(`/communities/${slug}/leave`).then((r) => r.data)),
  members: (slug) => (DESIGN_PREVIEW ? designData.members(slug) : api.get(`/communities/${slug}/members`).then((r) => r.data)),
  setModerator: (slug, payload) => (DESIGN_PREVIEW ? Promise.resolve({ ok: true, slug, ...payload }) : api.put(`/communities/${slug}/moderators`, payload).then((r) => r.data)),
  ban: (slug, payload) => (DESIGN_PREVIEW ? Promise.resolve({ ok: true, slug, ...payload }) : api.post(`/communities/${slug}/ban`, payload).then((r) => r.data)),
  unban: (slug, payload) => (DESIGN_PREVIEW ? Promise.resolve({ ok: true, slug, ...payload }) : api.post(`/communities/${slug}/unban`, payload).then((r) => r.data)),
  listBans: (slug) => (DESIGN_PREVIEW ? Promise.resolve([]) : api.get(`/communities/${slug}/bans`).then((r) => r.data)),
  uploadBanner: (slug, file) => {
    const form = new FormData();
    form.append('banner', file);
    if (DESIGN_PREVIEW) return Promise.resolve({ banner_url: URL.createObjectURL(file) });
    return api.post(`/communities/${slug}/banner`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
