import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMarketCaps } from '../../hooks/useMarketCaps';
import {
  formatMarketCap,
  formatPercent,
  formatPrice,
  formatUsdCompact,
} from '../../api/marketData';
import { IconExternalLink } from '../ui/Icon';

function shortAddress(addr) {
  if (!addr) return '';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function Stat({ label, value, tone }) {
  return (
    <div className={`token-stat ${tone || ''}`}>
      <span className="token-stat-label">{label}</span>
      <strong className="token-stat-value">{value}</strong>
    </div>
  );
}

export function TokenSidebar({ community }) {
  const ca = community?.contract_address;
  const [copied, setCopied] = useState(false);

  const { byAddress, isLoading } = useMarketCaps(ca ? [ca] : []);
  const data = ca ? byAddress(ca) : undefined;

  if (!ca) return null;

  const hasData = data && data.marketCap != null;
  const change = data?.priceChange24h;
  const changeTone = change == null ? 'neutral' : change >= 0 ? 'pos' : 'neg';
  const symbol = data?.symbol ? `$${data.symbol}` : 'Token';
  const name = data?.name || community.name;
  const imageUrl = data?.imageUrl;
  const pairUrl = data?.pairUrl;
  const chartUrl = pairUrl || `https://dexscreener.com/solana/${ca}`;
  const pumpUrl = community.pump_fun_link || `https://pump.fun/coin/${ca}`;

  async function copyCA() {
    try {
      await navigator.clipboard.writeText(ca);
      setCopied(true);
      toast.success('Contract copied');
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error('Could not copy');
    }
  }

  return (
    <aside className="token-sidebar">
      <div className="token-sidebar-live" aria-live="polite">
        <span className="token-live-dot" /> Live · Dexscreener
      </div>

      <div className="token-sidebar-identity">
        <div className="token-sidebar-logo" aria-hidden="true">
          {imageUrl ? (
            <img src={imageUrl} alt="" />
          ) : (
            <span>{(symbol || '?').replace('$', '').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="token-sidebar-identity-meta">
          <strong className="token-sidebar-symbol">{symbol}</strong>
          <span className="token-sidebar-name">{name}</span>
        </div>
      </div>

      <div className="token-sidebar-price-row">
        <div className="token-sidebar-price">
          {hasData ? formatPrice(data.priceUsd) : isLoading ? '…' : '?'}
        </div>
        <div className={`token-sidebar-change ${changeTone}`}>
          {hasData ? formatPercent(change) : '—'}
        </div>
      </div>

      <div className="token-sidebar-stats">
        <Stat label="Market cap" value={hasData ? formatMarketCap(data.marketCap) : '?'} />
        <Stat label="FDV" value={hasData && data.fdv != null ? formatMarketCap(data.fdv) : '?'} />
        <Stat label="Liquidity" value={hasData && data.liquidityUsd != null ? formatUsdCompact(data.liquidityUsd) : '?'} />
        <Stat label="24h Volume" value={hasData && data.volume24h != null ? formatUsdCompact(data.volume24h) : '?'} />
      </div>

      <button
        type="button"
        className="token-sidebar-ca"
        onClick={copyCA}
        title={`Click to copy · ${ca}`}
      >
        <span className="token-sidebar-ca-label">CONTRACT</span>
        <span className="token-sidebar-ca-value">{shortAddress(ca)}</span>
        <span className="token-sidebar-ca-action">{copied ? 'Copied' : 'Copy'}</span>
      </button>

      <div className="token-sidebar-links">
        <a
          href={chartUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost btn-sm token-sidebar-link"
        >
          Chart <IconExternalLink width={12} height={12} />
        </a>
        <a
          href={pumpUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost btn-sm token-sidebar-link"
        >
          Pump.fun <IconExternalLink width={12} height={12} />
        </a>
      </div>

      {!hasData && !isLoading && (
        <p className="token-sidebar-empty muted">
          No market data yet. Once this token pairs on Dexscreener, stats go live automatically.
        </p>
      )}
    </aside>
  );
}
