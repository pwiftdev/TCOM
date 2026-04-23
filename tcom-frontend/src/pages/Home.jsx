import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { communityApi } from '../api/communities';
import { CommunityCard } from '../components/community/CommunityCard';
import { LoginWithX } from '../components/auth/LoginWithX';
import { useAuthStore } from '../store/authStore';
import { IconPlus, IconX } from '../components/ui/Icon';
import { useMarketCaps } from '../hooks/useMarketCaps';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'new', label: 'New' },
];
const TCOM_CA = '6oqrBATpFy8ispnR7b2Fc2gUniJ6dj31Z3MXcVHepump';

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState('all');
  const [copiedTokenCA, setCopiedTokenCA] = useState(false);

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

  async function copyTokenCA() {
    try {
      await navigator.clipboard.writeText(TCOM_CA);
      setCopiedTokenCA(true);
      toast.success('TCOM contract copied');
      setTimeout(() => setCopiedTokenCA(false), 1400);
    } catch {
      toast.error('Could not copy contract');
    }
  }

  const stats = useMemo(() => {
    const totalMembers = communities.reduce((acc, c) => acc + (c.member_count || 0), 0);
    const totalPosts = communities.reduce((acc, c) => acc + (c.post_count || 0), 0);
    return { communities: communities.length, members: totalMembers, posts: totalPosts };
  }, [communities]);

  const communityAddresses = useMemo(
    () => communities.map((c) => c.contract_address).filter(Boolean),
    [communities],
  );
  const { byAddress: mcapByAddress } = useMarketCaps(communityAddresses);

  function mcapForCommunity(c) {
    if (!c.contract_address) return undefined;
    const entry = mcapByAddress(c.contract_address);
    if (entry === undefined) return null; // still loading → show '?'
    if (entry === null) return null; // no data
    return entry.marketCap ?? null;
  }

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
        <div className="hero-v2-inner container">
          <div className="hero-v2-row">
            <div className="hero-v2-copy">
              <div className="hero-v2-eyebrow">
                <span className="hero-v2-dot" /> CRYPTO COMMUNITIES, REGROUPED.
              </div>
              <h1 className="hero-v2-title">
                <span className="hero-v2-title-line">The trenches,</span>
                <span className="hero-v2-title-line accent">regrouped.</span>
              </h1>
              <p className="hero-v2-sub">
                Home for crypto natives. Communities powered by your X identity — share alpha, build together, and move as one.
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
              <div className="hero-visual-pattern" />
              <img src="/logo.svg" alt="" className="hero-visual-logo" />
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

      {/* Explore */}
      <section id="explore" className="container explore">
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
              <CommunityCard key={c.id} community={c} marketCap={mcapForCommunity(c)} />
            ))}
          </div>
        )}
      </section>

      {/* Built for crypto natives */}
      <section id="about" className="container">
        <div className="crowd-card fade-in">
          <div className="crowd-card-visual" aria-hidden="true">
            <div className="crowd-card-pattern" />
            <div className="crowd-card-fade" />
          </div>
          <div className="crowd-card-copy">
            <div className="crowd-card-eyebrow">BUILT FOR CRYPTO NATIVES</div>
            <h2 className="crowd-card-title">Communities that cut through the noise.</h2>
            <p className="crowd-card-sub">
              No scammers. No hype loops. Just aligned people, building the future, together.
            </p>
          </div>
        </div>
        <div className="tokenomics-card fade-in">
          <div className="tokenomics-eyebrow">$TCOM TOKENOMICS</div>
          <h3 className="tokenomics-title">Fair launch on Pump.fun, home of the Solana network.</h3>
          <p className="tokenomics-sub">
            95% fair launch, 5% dev buy and lock.
          </p>
          <div className="tokenomics-ca-row">
            <code className="tokenomics-ca" title={TCOM_CA}>{TCOM_CA}</code>
            <button type="button" className="btn tokenomics-copy-btn" onClick={copyTokenCA}>
              {copiedTokenCA ? 'Copied' : 'Copy CA'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer id="docs" className="cta-footer">
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

