import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { communityApi } from '../../api/communities';
import { Avatar } from '../ui/Avatar';
import { Dialog } from '../ui/Dialog';

export function MembersDialog({ open, onOpenChange, communitySlug, memberCount }) {
  const { data, isLoading } = useQuery({
    queryKey: ['members', communitySlug],
    queryFn: () => communityApi.members(communitySlug),
    enabled: open,
    staleTime: 10_000,
  });
  const members = (data || []).filter((m) => m?.users?.username);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Members${memberCount ? ` · ${memberCount}` : ''}`}
    >
      {isLoading && (
        <div className="muted"><span className="spinner" /> Loading members…</div>
      )}
      {!isLoading && members.length === 0 && <p className="muted">No members yet.</p>}
      <div>
        {members.map((m) => (
          <div className="member-row" key={m.id || `${m.user_id}-${m.joined_at}`}>
            <Avatar size="sm" src={m.users?.avatar_url} name={m.users?.username} />
            <div className="member-info">
              <strong>{m.users?.display_name || m.users?.username || 'Unknown'}</strong>
              <span>
                {m.users?.username ? (
                  <Link to={`/profile/${m.users.username}`} onClick={() => onOpenChange(false)}>
                    @{m.users.username}
                  </Link>
                ) : (
                  'unknown'
                )}
              </span>
            </div>
            <span className="pill role">{m.role}</span>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
