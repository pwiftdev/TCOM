import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../../api/stats';

function formatCount(n) {
  if (n == null) return 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n;
}

export function OnlineIndicator() {
  const { data } = useQuery({
    queryKey: ['stats', 'online'],
    queryFn: statsApi.online,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
  });

  const count = data?.online ?? 0;

  return (
    <span
      className="online-indicator"
      title={`${count} ${count === 1 ? 'person' : 'people'} active in the last 2 minutes`}
      aria-label={`${count} online`}
    >
      <span className="online-indicator-dot" aria-hidden="true" />
      <strong>{formatCount(count)}</strong>
      <span className="online-indicator-label">online</span>
    </span>
  );
}
