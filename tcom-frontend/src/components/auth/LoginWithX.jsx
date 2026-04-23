import { IconX } from '../ui/Icon';

export function LoginWithX({ label = 'Sign in with X' }) {
  const base = import.meta.env.VITE_API_URL;
  return (
    <a className="x-login" href={`${base}/auth/x`}>
      <IconX /> {label}
    </a>
  );
}
