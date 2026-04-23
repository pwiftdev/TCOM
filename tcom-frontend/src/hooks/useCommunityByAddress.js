import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../api/communities';

/**
 * Loads the full communities list (cached 5 min) and exposes a
 * lookup function that maps a contract address -> community.
 * Used to linkify $CA mentions inside posts.
 */
export function useCommunityByAddress() {
  const { data } = useQuery({
    queryKey: ['communities'],
    queryFn: communityApi.list,
    staleTime: 5 * 60_000,
  });

  const byAddress = useMemo(() => {
    const map = new Map();
    for (const c of data || []) {
      if (c?.contract_address) {
        map.set(c.contract_address.trim().toLowerCase(), c);
      }
    }
    return map;
  }, [data]);

  return {
    resolve: (addr) => {
      if (!addr || typeof addr !== 'string') return null;
      return byAddress.get(addr.trim().toLowerCase()) || null;
    },
    size: byAddress.size,
  };
}
