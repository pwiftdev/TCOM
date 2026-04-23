import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export function useAuthBootstrap() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.isError) logout();
  }, [query.isError, logout]);

  return query;
}
