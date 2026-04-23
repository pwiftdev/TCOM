const DEXSCREENER_BASE = 'https://api.dexscreener.com/tokens/v1';
const DEXSCREENER_CHAIN = 'solana';
// Dexscreener accepts up to 30 addresses per request
const CHUNK_SIZE = 30;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function pickBestPair(pairs, address) {
  const lower = address.toLowerCase();
  const matching = (pairs || []).filter(
    (p) => p?.baseToken?.address?.toLowerCase() === lower,
  );
  const pool = matching.length ? matching : pairs || [];
  if (!pool.length) return null;
  return pool.reduce((best, cur) => {
    const bestLiq = best?.liquidity?.usd || 0;
    const curLiq = cur?.liquidity?.usd || 0;
    return curLiq > bestLiq ? cur : best;
  }, pool[0]);
}

async function fetchChunk(addresses) {
  const joined = addresses.join(',');
  const url = `${DEXSCREENER_BASE}/${DEXSCREENER_CHAIN}/${joined}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Dexscreener request failed (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch Dexscreener market data for a list of Solana token addresses.
 * Returns a map: address (lowercased) -> { marketCap, priceUsd, symbol } | null
 */
export async function fetchMarketCaps(addresses) {
  const valid = [...new Set(
    (addresses || [])
      .filter((a) => typeof a === 'string' && a.trim().length >= 32 && a.trim().length <= 64)
      .map((a) => a.trim()),
  )];
  if (valid.length === 0) return {};

  const chunks = chunk(valid, CHUNK_SIZE);
  const pairLists = await Promise.all(
    chunks.map((group) => fetchChunk(group).catch(() => [])),
  );
  const pairs = pairLists.flat();

  const result = {};
  for (const address of valid) {
    const best = pickBestPair(pairs, address);
    const key = address.toLowerCase();
    if (!best) {
      result[key] = null;
      continue;
    }
    const marketCap = typeof best.marketCap === 'number'
      ? best.marketCap
      : typeof best.fdv === 'number'
        ? best.fdv
        : null;
    const priceUsd = best.priceUsd ? Number(best.priceUsd) : null;
    const fdv = typeof best.fdv === 'number' ? best.fdv : null;
    const liquidityUsd = typeof best?.liquidity?.usd === 'number' ? best.liquidity.usd : null;
    const volume24h = typeof best?.volume?.h24 === 'number' ? best.volume.h24 : null;
    const priceChange24h = typeof best?.priceChange?.h24 === 'number' ? best.priceChange.h24 : null;
    const priceChange1h = typeof best?.priceChange?.h1 === 'number' ? best.priceChange.h1 : null;
    const txns24h = best?.txns?.h24 || null;
    const imageUrl = best?.info?.imageUrl || null;
    const socials = best?.info?.socials || [];
    const websites = best?.info?.websites || [];
    result[key] = {
      marketCap,
      fdv,
      priceUsd: Number.isFinite(priceUsd) ? priceUsd : null,
      priceChange24h,
      priceChange1h,
      volume24h,
      liquidityUsd,
      txns24h,
      symbol: best?.baseToken?.symbol || null,
      name: best?.baseToken?.name || null,
      imageUrl,
      pairUrl: best.url || null,
      dexId: best.dexId || null,
      chainId: best.chainId || 'solana',
      pairAddress: best.pairAddress || null,
      socials,
      websites,
    };
  }
  return result;
}

export function formatPrice(value) {
  if (value == null || !Number.isFinite(value) || value <= 0) return '?';
  if (value >= 1) return `$${value.toFixed(3)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  // For very small prices use a compact subscript style so it doesn't blow up the UI
  return `$${value.toExponential(2)}`;
}

export function formatUsdCompact(value) {
  if (value == null || !Number.isFinite(value) || value <= 0) return '?';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
}

export function formatPercent(value) {
  if (value == null || !Number.isFinite(value)) return '?';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format a market cap number the way traders expect.
 * null / undefined / 0 / NaN → '?'
 */
export function formatMarketCap(value) {
  if (value == null || !Number.isFinite(value) || value <= 0) return '?';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
}
