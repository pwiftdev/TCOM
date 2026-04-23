import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMarketCaps } from '../api/marketData';

/**
 * Batch-fetch market caps for a list of Solana token addresses via Dexscreener.
 * Returns { byAddress, isLoading, isError, data }.
 *   byAddress(addr) -> { marketCap, priceUsd, symbol } | null | undefined
 *     undefined = loading / unknown, null = no data, object = found.
 */
export function useMarketCaps(rawAddresses = []) {
  const { normalized, key } = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const a of rawAddresses || []) {
      if (typeof a !== 'string') continue;
      const v = a.trim();
      if (!v) continue;
      const lower = v.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      out.push(v);
    }
    return { normalized: out, key: out.map((a) => a.toLowerCase()).sort().join(',') };
  }, [rawAddresses]);

  const query = useQuery({
    queryKey: ['marketCaps', key],
    queryFn: () => fetchMarketCaps(normalized),
    enabled: normalized.length > 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  const byAddress = (addr) => {
    if (!addr || typeof addr !== 'string') return undefined;
    if (!query.data) return undefined;
    return query.data[addr.trim().toLowerCase()];
  };

  return {
    byAddress,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
