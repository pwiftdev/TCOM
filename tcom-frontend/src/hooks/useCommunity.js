import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../api/communities';

export function useCommunity(slug) { return useQuery({ queryKey: ['community', slug], queryFn: () => communityApi.get(slug), enabled: Boolean(slug) }); }
export function useJoinCommunity(slug) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => communityApi.join(slug), onSuccess: () => qc.invalidateQueries({ queryKey: ['community', slug] }) });
}
