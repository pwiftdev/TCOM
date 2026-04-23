import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export function useAuthBootstrap() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({ queryKey: ['auth', 'me'], queryFn: authApi.me, enabled: Boolean(token), retry: false, onSuccess: setUser });
}
