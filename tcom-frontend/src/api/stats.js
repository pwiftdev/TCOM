import { api } from './client';

export const statsApi = {
  online: () => api.get('/stats/online').then((r) => r.data),
};
