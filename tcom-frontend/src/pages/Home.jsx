import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { communityApi } from '../api/communities';
import { CommunityCard } from '../components/community/CommunityCard';
import { LoginWithX } from '../components/auth/LoginWithX';
import { useAuthStore } from '../store/authStore';
import { IconPlus, IconX, IconUsers, IconSparkles } from '../components/ui/Icon';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'new', label: 'New' },
];

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState('all');

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

  const stats = useMemo(() => {
    const totalMembers = communities.reduce((acc, c) => acc + (c.member_count || 0), 0);
    const totalPosts = communities.reduce((acc, c) => acc + (c.post_count || 0), 0);
    return { communities: communities.length, members: totalMembers, posts: totalPosts };
  }, [communities]);

  const filteredCommunities = useMemo(() => {
    const arr = [...communities];
    if (filter === 'trending') {
      return arr.sort((a, b) => (b.member_count || 0) - (a.member_count || 0));
    }
    if (filter === 'new') {
      return arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    return arr;
  }, [communities, filter]);

  const tickerNames = communities.slice(0, 10).map((c) => c.name);
  const hasTicker = tickerNames.length > 0;

  return (
    <div className="home fade-in">
      {/* Hero */}
      <section className="hero-v2">
        <div className="hero-v2-aurora" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="hero-v2-grid-bg" />
        </div>

        <div className="hero-v2-inner container">
          <div className="hero-v2-row">
            <div className="hero-v2-copy">
              <div className="hero-v2-eyebrow">
                <span className="hero-v2-dot" /> TCOM · CRYPTO COMMUNITIES
              </div>
              <h1 className="hero-v2-title">
                <span className="hero-v2-title-line">The trenches,</span>
                <span className="hero-v2-title-line accent">regrouped.</span>
              </h1>
              <p className="hero-v2-sub">
                Home for crypto natives. Communities powered by your X identity — share alpha, build your tribe, own your voice.
              </p>

              <div className="hero-v2-actions">
                {user ? (
                  <>
                    <Link className="btn btn-lg" to="/create">
                      <IconPlus width={14} height={14} /> Create community
                    </Link>
                    <button type="button" className="btn-ghost btn-lg" onClick={shareTcomOnX}>
                      <IconX width={14} height={14} /> Share TCOM on X
                    </button>
                  </>
                ) : (
                  <>
                    <LoginWithX label="Sign in with X" />
                    <button type="button" className="btn-ghost btn-lg" onClick={shareTcomOnX}>
                      <IconX width={14} height={14} /> Share TCOM on X
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="hero-v2-visual" aria-hidden="true">
              <div className="hero-logo-stage">
                <div className="hero-logo-glow" />
                <div className="hero-logo-ring hero-logo-ring-3" />
                <div className="hero-logo-ring hero-logo-ring-2" />
                <div className="hero-logo-ring hero-logo-ring-1" />
                <div className="hero-logo-orbit hero-logo-orbit-outer">
                  <span className="hero-logo-orbit-dot" />
                </div>
                <div className="hero-logo-orbit hero-logo-orbit-mid">
                  <span className="hero-logo-orbit-dot" />
                </div>
                <div className="hero-logo-orbit hero-logo-orbit-inner">
                  <span className="hero-logo-orbit-dot" />
                </div>
                <svg className="hero-logo-loop" viewBox="0 0 320 320" aria-hidden="true">
                  <defs>
                    <path
                      id="heroLogoTextPath"
                      d="M160,160 m-138,0 a138,138 0 1,1 276,0 a138,138 0 1,1 -276,0"
                    />
                  </defs>
                  <text className="hero-logo-loop-text">
                    <textPath href="#heroLogoTextPath" startOffset="0">
                      TCOM · THE TRENCHES · REGROUPED · CRYPTO COMMUNITIES · POWERED BY X ·&nbsp;
                    </textPath>
                  </text>
                </svg>
                <div className="hero-logo-disc">
                  <img src="/tcomlogo.jpeg" alt="" className="hero-logo-img" />
                </div>
              </div>
            </div>
          </div>

          <div className="hero-v2-stats">
            <Stat label="Communities" value={stats.communities} />
            <span className="hero-v2-stat-sep" />
            <Stat label="Members" value={stats.members} />
            <span className="hero-v2-stat-sep" />
            <Stat label="Posts" value={stats.posts} />
          </div>

          {hasTicker && (
            <div className="hero-v2-ticker" aria-hidden="true">
              <div className="hero-v2-ticker-track">
                {[...tickerNames, ...tickerNames].map((name, i) => (
                  <span key={`${name}-${i}`} className="hero-v2-ticker-item">
                    <span className="hero-v2-ticker-dot" /> {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature strip */}
      <section className="container feature-strip">
        <FeatureTile
          icon={<IconUsers width={18} height={18} />}
          eyebrow="01"
          title="Regroup"
          body="Find your people fast. Move from noise to conviction with focused feeds."
        />
        <FeatureTile
          icon={<IconSparkles width={18} height={18} />}
          eyebrow="02"
          title="Coordinate"
          body="Drop thesis, post setups, reply in-thread, and build context like a living playbook."
        />
        <FeatureTile
          icon={<IconX width={14} height={14} />}
          eyebrow="03"
          title="Push"
          body="When it’s time to broadcast, push your community and its alpha straight back to X."
        />
      </section>

      {/* Explore */}
      <section className="container explore">
        <div className="explore-head">
          <div>
            <div className="eyebrow-label">EXPLORE</div>
            <h2 className="section-title">Communities</h2>
          </div>
          <div className="feed-sort-tabs" role="tablist" aria-label="Filter communities">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`feed-sort-tab ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="explore-grid-skeleton">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="community-card card skeleton-card" />
            ))}
          </div>
        )}
        {isError && (
          <div className="card muted">Could not load communities. Try again soon.</div>
        )}
        {!isLoading && !isError && filteredCommunities.length === 0 && (
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

        {filteredCommunities.length > 0 && (
          <div className="explore-grid">
            {filteredCommunities.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </section>

      {/* Lore */}
      <section className="container">
        <div className="lore-v2 fade-in">
          <div className="lore-headline">THE TRENCHES NEVER LOG OFF</div>
          <h2>
            Trenches, X decided to take down your main weapon.{' '}
            <span>TCOMs are here now.</span>
          </h2>
          <p>
            Market moving at lightspeed. Threads buried. Signals fragmented. Your crew still needs a base. TCOM is the
            war room: communities, posts, replies, receipts, all anchored to X identity.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="cta-footer">
        <div className="container cta-footer-inner">
          <div>
            <div className="eyebrow-label">READY?</div>
            <h2>Start your community in under a minute.</h2>
          </div>
          <div className="cta-strip-actions">
            {user ? (
              <Link className="btn btn-lg" to="/create">
                <IconPlus width={14} height={14} /> Create community
              </Link>
            ) : (
              <LoginWithX label="Sign in to create" />
            )}
            <button type="button" className="btn-ghost btn-lg" onClick={shareTcomOnX}>
              <IconX width={14} height={14} /> Share on X
            </button>
          </div>
        </div>
        <div className="cta-footer-bottom container">
          <span className="muted">© TCOM · Crypto communities with X-powered identity</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="hero-v2-stat">
      <div className="hero-v2-stat-value">{value.toLocaleString()}</div>
      <div className="hero-v2-stat-label">{label}</div>
    </div>
  );
}

function FeatureTile({ icon, eyebrow, title, body }) {
  return (
    <article className="feature-tile">
      <div className="feature-tile-head">
        <span className="feature-tile-icon">{icon}</span>
        <span className="feature-tile-eyebrow">{eyebrow}</span>
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
