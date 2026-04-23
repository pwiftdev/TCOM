import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../api/communities';
import { CommunityCard } from '../components/community/CommunityCard';
import { LoginWithX } from '../components/auth/LoginWithX';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const { data } = useQuery({ queryKey: ['communities'], queryFn: communityApi.list });
  const user = useAuthStore((s) => s.user);
  return (
    <div className="container grid">
      <div className="card"><h1>TCOM</h1><p>Crypto communities with X-powered identity.</p>{user ? <p>Welcome back @{user.username}</p> : <LoginWithX />}</div>
      <div className="grid grid-2">{(data || []).map((community) => <CommunityCard key={community.id} community={community} />)}</div>
    </div>
  );
}
