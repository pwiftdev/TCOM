import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { communityApi } from '../api/communities';
import { CommunityCard } from '../components/community/CommunityCard';
import { LoginWithX } from '../components/auth/LoginWithX';
import { useAuthStore } from '../store/authStore';
import { IconPlus, IconX } from '../components/ui/Icon';

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['communities'],
    queryFn: communityApi.list,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const communities = data || [];
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = 'Trenches, X decided to take down your main weapon. TCOMs are here now.';

  function shareTcomOnX() {
    if (!shareUrl) return;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

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
          <button type="button" className="btn-ghost" onClick={shareTcomOnX}>
            <IconX width={14} height={14} /> Share TCOM on X
          </button>
        </div>
      </section>

      <section className="lore fade-in">
        <div className="lore-headline">THE TRENCHES NEVER LOG OFF</div>
        <h2>Trenches, X decided to take down your main weapon. <span>TCOMs are here now.</span></h2>
        <p>
          Market moving at lightspeed. Threads buried. Signals fragmented. Your crew still needs a base. TCOM is the
          war room: communities, posts, replies, receipts, all anchored to X identity.
        </p>
        <div className="lore-grid">
          <article className="lore-card">
            <h3>01 — Regroup</h3>
            <p>Find your people fast. Move from noise to conviction with focused community feeds.</p>
          </article>
          <article className="lore-card">
            <h3>02 — Coordinate</h3>
            <p>Drop thesis, post setups, reply in-thread, and build context like a living playbook.</p>
          </article>
          <article className="lore-card">
            <h3>03 — Push</h3>
            <p>When it’s time to broadcast, push your community and its alpha straight back to X.</p>
          </article>
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
