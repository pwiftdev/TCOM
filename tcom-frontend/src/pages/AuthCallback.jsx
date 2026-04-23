import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    async function run() {
      const token = new URLSearchParams(window.location.search).get('token');
      if (!token) return navigate('/');
      localStorage.setItem('tcom_token', token);
      const user = await authApi.me();
      setAuth({ token, user });
      navigate('/');
    }
    run();
  }, [navigate, setAuth]);

  return <div className="container">Completing login...</div>;
}
