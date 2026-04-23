import { Link } from 'react-router-dom';
import { IconUsers } from '../ui/Icon';
import { formatMarketCap } from '../../api/marketData';

function shortAddress(addr) {
  if (!addr) return '';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function CommunityCard({ community, marketCap }) {
  const memberCount = community.member_count ?? 0;
  const postCount = community.post_count ?? 0;
  const showMcap = Boolean(community.contract_address) && marketCap !== undefined;
  const mcapLabel = marketCap === null || marketCap === undefined ? '?' : formatMarketCap(marketCap);

  return (
    <Link to={`/c/${community.slug}`} className="community-card-v2">
      <div className="community-banner-v2">
        {community.banner_url ? (
          <img src={community.banner_url} alt="" loading="lazy" />
        ) : (
          <div className="community-banner-fallback" aria-hidden="true">
            <span>{(community.name || '?').charAt(0).toUpperCase()}</span>
          </div>
        )}
        <div className="community-banner-scrim" />
        <span className={`pill visibility-pill ${community.visibility}`}>{community.visibility}</span>
      </div>

      <div className="community-card-v2-body">
        <div className="community-card-v2-head">
          <h3>{community.name}</h3>
        </div>
        <p className="community-card-v2-desc">
          {community.description || 'No description yet.'}
        </p>

        {community.contract_address && (
          <div className="community-card-v2-chips">
            <span className="token-chip token-ca" title={community.contract_address}>
              <span className="token-chip-label">CA</span>
              <span className="token-chip-value">{shortAddress(community.contract_address)}</span>
            </span>
            {showMcap && (
              <span
                className={`token-chip token-mcap ${mcapLabel === '?' ? 'token-mcap-empty' : ''}`}
                title={mcapLabel === '?' ? 'Market cap unavailable' : `Market cap · ${mcapLabel}`}
              >
                <span className="token-chip-label">MCAP</span>
                <span className="token-chip-value">{mcapLabel}</span>
              </span>
            )}
            {community.pump_fun_link && (
              <span className="token-chip token-link">
                <span className="token-dot" /> Pump.fun
              </span>
            )}
          </div>
        )}

        <div className="community-card-v2-meta">
          <span className="meta-stat">
            <IconUsers width={12} height={12} />
            <strong>{memberCount.toLocaleString()}</strong>
            <span>member{memberCount === 1 ? '' : 's'}</span>
          </span>
          <span className="meta-stat">
            <strong>{postCount.toLocaleString()}</strong>
            <span>post{postCount === 1 ? '' : 's'}</span>
          </span>
          <span className="community-card-v2-cta">Enter →</span>
        </div>
      </div>
    </Link>
  );
}
