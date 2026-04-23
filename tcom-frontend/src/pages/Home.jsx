import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { communityApi } from '../api/communities';
import { CommunityCard } from '../components/community/CommunityCard';
import { LoginWithX } from '../components/auth/LoginWithX';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['communities'], queryFn: communityApi.list });
  const user = useAuthStore((s) => s.user);

  const communities = data || [];

  return (
    <div className="container grid">
      <div className="card hero-card">
        <h1>TCOM</h1>
        <p>Crypto communities with X-powered identity.</p>
        {user ? (
          <div className="hero-actions">
            <p>Welcome back @{user.username}</p>
            <Link className="btn" to="/create">Create a community</Link>
          </div>
        ) : (
          <LoginWithX />
        )}
      </div>

      <section className="grid">
        <div className="section-title-row">
          <h2>Discover Communities</h2>
          <span className="muted">{communities.length} found</span>
        </div>

        {isLoading && <div className="card muted">Loading communities...</div>}
        {isError && <div className="card muted">Could not load communities. Try refreshing.</div>}
        {!isLoading && !isError && communities.length === 0 && (
          <div className="card empty-state">
            <h3>No communities yet</h3>
            <p>Be the first to create one and start the conversation.</p>
            {user ? <Link className="btn" to="/create">Create first community</Link> : <LoginWithX />}
          </div>
        )}
        <div className="grid grid-2">
          {communities.map((community) => <CommunityCard key={community.id} community={community} />)}
        </div>
      </section>
    </div>
  );
}
