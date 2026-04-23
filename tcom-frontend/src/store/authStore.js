import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('tcom_token'),
  user: null,
  setAuth: ({ token, user }) => { localStorage.setItem('tcom_token', token); set({ token, user }); },
  setUser: (user) => set({ user }),
  logout: () => { localStorage.removeItem('tcom_token'); set({ token: null, user: null }); },
}));
