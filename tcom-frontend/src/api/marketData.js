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
    result[key] = {
      marketCap,
      priceUsd: Number.isFinite(priceUsd) ? priceUsd : null,
      symbol: best?.baseToken?.symbol || null,
      pairUrl: best.url || null,
    };
  }
  return result;
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
