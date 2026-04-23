import { api } from './client';
export const authApi = {
  me: () => api.get('/auth/me').then((r) => r.data),
  refreshProfile: () => api.post('/auth/refresh-profile').then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
};
