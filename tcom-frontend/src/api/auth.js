import { api } from './client';
import { DESIGN_PREVIEW, designData } from '../lib/designPreview';
export const authApi = {
  me: () => (DESIGN_PREVIEW ? designData.authMe() : api.get('/auth/me').then((r) => r.data)),
  refreshProfile: () => api.post('/auth/refresh-profile').then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
};
