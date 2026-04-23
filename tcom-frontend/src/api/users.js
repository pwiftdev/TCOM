import { api } from './client';
export const userApi = { getByUsername: (username) => api.get(`/users/${username}`).then((r) => r.data) };
