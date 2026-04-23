import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { communityApi } from '../api/communities';
import { CommunityCard } from '../components/community/CommunityCard';
import { LoginWithX } from '../components/auth/LoginWithX';
import { useAuthStore } from '../store/authStore';
import { IconPlus } from '../components/ui/Icon';

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['communities'],
    queryFn: communityApi.list,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const communities = data || [];

  return (
    <div className="container grid fade-in">
      <section className="hero">
        <h1>Welcome to TCOM</h1>
        <p className="hero-sub">
          Crypto-native communities powered by your X identity. Share alpha, build your tribe, own your voice.
        </p>
        <div className="hero-actions">
          {user ? (
            <>
              <Link className="btn" to="/create">
                <IconPlus width={14} height={14} /> Create community
              </Link>
              <span className="muted">Signed in as @{user.username}</span>
            </>
          ) : (
            <LoginWithX />
          )}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>Explore communities</h2>
          {!isLoading && !isError && (
            <span className="muted">{communities.length} total</span>
          )}
        </div>

        {isLoading && (
          <div className="card muted">
            <span className="spinner" /> Loading communities…
          </div>
        )}
        {isError && (
          <div className="card muted">Could not load communities. Try again soon.</div>
        )}
        {!isLoading && !isError && communities.length === 0 && (
          <div className="card empty-state">
            <h3>No communities yet</h3>
            <p>Be the first to create one.</p>
            {user ? (
              <Link className="btn" to="/create">
                <IconPlus width={14} height={14} /> Create first community
              </Link>
            ) : (
              <LoginWithX />
            )}
          </div>
        )}

        {communities.length > 0 && (
          <div className="grid grid-2">
            {communities.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
