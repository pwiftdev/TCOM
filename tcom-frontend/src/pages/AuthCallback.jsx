import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    async function run() {
      const token = new URLSearchParams(window.location.search).get('token');
      if (!token) {
        toast.error('Login cancelled');
        navigate('/');
        return;
      }
      localStorage.setItem('tcom_token', token);
      try {
        const user = await authApi.me();
        setAuth({ token, user });
        toast.success(`Welcome, @${user.username}`);
      } catch {
        toast.error('Could not complete sign-in');
      }
      navigate('/');
    }
    run();
  }, [navigate, setAuth]);

  return (
    <div className="container">
      <div className="card muted">
        <span className="spinner" /> Completing sign-in…
      </div>
    </div>
  );
}
