import { Link } from 'react-router-dom';
import { useCommunityByAddress } from '../../hooks/useCommunityByAddress';
import { useMarketCaps } from '../../hooks/useMarketCaps';

// Base58 Solana-style address pattern (32-44 chars, no 0/O/I/l).
const SOLANA_ADDRESS = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
const URL_REGEX = /\bhttps?:\/\/[^\s<>"']+/gi;

function short(addr) {
  if (!addr) return '';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Tokenize a string into segments of type { type: 'text' | 'url' | 'ca', value }.
 * Runs URL detection first, then scans non-URL text for Solana addresses.
 */
function tokenize(raw) {
  if (!raw) return [];
  const urls = [];
  const urlRegex = new RegExp(URL_REGEX.source, 'gi');
  let match;
  while ((match = urlRegex.exec(raw)) !== null) {
    urls.push({ start: match.index, end: match.index + match[0].length, value: match[0] });
  }

  const tokens = [];
  let cursor = 0;
  for (const u of urls) {
    if (u.start > cursor) tokens.push({ type: 'text', value: raw.slice(cursor, u.start) });
    tokens.push({ type: 'url', value: u.value });
    cursor = u.end;
  }
  if (cursor < raw.length) tokens.push({ type: 'text', value: raw.slice(cursor) });

  // Within each plain 'text' segment, pull out Solana addresses
  const finalTokens = [];
  for (const tok of tokens) {
    if (tok.type !== 'text') {
      finalTokens.push(tok);
      continue;
    }
    const text = tok.value;
    const re = new RegExp(SOLANA_ADDRESS.source, 'g');
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) finalTokens.push({ type: 'text', value: text.slice(last, m.index) });
      finalTokens.push({ type: 'ca', value: m[0] });
      last = m.index + m[0].length;
    }
    if (last < text.length) finalTokens.push({ type: 'text', value: text.slice(last) });
  }
  return finalTokens;
}

function CAMention({ address, resolveCommunity, symbolByAddress }) {
  const community = resolveCommunity(address);
  const market = symbolByAddress(address);
  const label = community ? community.name : market?.symbol ? `$${market.symbol}` : short(address);

  if (community) {
    return (
      <Link
        to={`/c/${community.slug}`}
        className="ca-mention internal"
        title={`${community.name} · ${address}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="ca-mention-badge">CA</span>
        <span className="ca-mention-label">{label}</span>
      </Link>
    );
  }
  return (
    <a
      href={`https://dexscreener.com/solana/${address}`}
      target="_blank"
      rel="noreferrer"
      className="ca-mention external"
      title={`View on Dexscreener · ${address}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="ca-mention-badge">CA</span>
      <span className="ca-mention-label">{label}</span>
    </a>
  );
}

function isLikelySolanaAddress(v) {
  return typeof v === 'string' && v.length >= 32 && v.length <= 44;
}

export function PostContent({ text }) {
  const tokens = tokenize(text || '');

  const addresses = tokens
    .filter((t) => t.type === 'ca' && isLikelySolanaAddress(t.value))
    .map((t) => t.value);

  const { resolve } = useCommunityByAddress();
  const { byAddress } = useMarketCaps(addresses);

  return (
    <p className="post-content">
      {tokens.map((tok, i) => {
        if (tok.type === 'text') return <span key={i}>{tok.value}</span>;
        if (tok.type === 'url') {
          return (
            <a
              key={i}
              href={tok.value}
              target="_blank"
              rel="noreferrer"
              className="post-content-link"
              onClick={(e) => e.stopPropagation()}
            >
              {tok.value}
            </a>
          );
        }
        if (tok.type === 'ca') {
          return (
            <CAMention
              key={i}
              address={tok.value}
              resolveCommunity={resolve}
              symbolByAddress={byAddress}
            />
          );
        }
        return null;
      })}
    </p>
  );
}
