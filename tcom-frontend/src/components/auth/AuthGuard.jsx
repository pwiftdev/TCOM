import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function AuthGuard({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/" replace />;
}
