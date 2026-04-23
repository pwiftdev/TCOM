import { api } from './client';
import { DESIGN_PREVIEW, designData } from '../lib/designPreview';
export const userApi = {
  getByUsername: (username) => (DESIGN_PREVIEW ? designData.profile(username) : api.get(`/users/${username}`).then((r) => r.data)),
  communities: (username) => (DESIGN_PREVIEW ? designData.profileCommunities(username) : api.get(`/users/${username}/communities`).then((r) => r.data)),
};
