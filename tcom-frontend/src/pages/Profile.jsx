import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { userApi } from '../api/users';
import { Avatar } from '../components/ui/Avatar';
import { CommunityCard } from '../components/community/CommunityCard';
import { IconX, IconUsers } from '../components/ui/Icon';

function formatCount(n) {
  if (n == null) return 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function Profile() {
  const { username } = useParams();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => userApi.getByUsername(username),
  });

  const { data: communities = [], isLoading: loadingCommunities } = useQuery({
    queryKey: ['profile', username, 'communities'],
    queryFn: () => userApi.communities(username),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="container fade-in">
        <div className="card muted"><span className="spinner" /> Loading profile…</div>
      </div>
    );
  }
  if (isError || !user) {
    return (
      <div className="container fade-in">
        <div className="card empty-state">
          <h3>User not found</h3>
          <p>@{username} doesn’t exist yet.</p>
        </div>
      </div>
    );
  }

  const joined = user.created_at ? dayjs(user.created_at).format('MMM YYYY') : null;
  const owned = communities.filter((c) => c.role === 'owner');
  const modding = communities.filter((c) => c.role === 'moderator');
  const joining = communities.filter((c) => c.role === 'member');

  return (
    <div className="profile-v2 fade-in">
      <section className="profile-v2-hero">
        <div className="profile-v2-cover" aria-hidden="true">
          <div className="profile-v2-cover-orb orb-a" />
          <div className="profile-v2-cover-orb orb-b" />
        </div>
        <div className="container">
          <div className="profile-v2-identity">
            <div className="profile-v2-avatar">
              <Avatar size="lg" src={user.avatar_url} name={user.username} />
            </div>
            <div className="profile-v2-identity-body">
              <div className="profile-v2-namerow">
                <h1>{user.display_name || user.username}</h1>
                <a
                  href={`https://x.com/${user.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost profile-v2-x-btn"
                >
                  <IconX width={12} height={12} /> View on X
                </a>
              </div>
              <div className="profile-v2-handle">
                @{user.username}
                {joined && <span className="muted"> · Joined X {joined}</span>}
              </div>
              {user.bio && <p className="profile-v2-bio">{user.bio}</p>}
            </div>
            <div className="profile-v2-stats">
              <div className="profile-v2-stat">
                <div className="profile-v2-stat-value">{formatCount(user.followers_count)}</div>
                <div className="profile-v2-stat-label">Followers</div>
              </div>
              <div className="profile-v2-stat">
                <div className="profile-v2-stat-value">{formatCount(user.following_count)}</div>
                <div className="profile-v2-stat-label">Following</div>
              </div>
              <div className="profile-v2-stat">
                <div className="profile-v2-stat-value">{communities.length}</div>
                <div className="profile-v2-stat-label">Communities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container profile-v2-communities">
        <div className="section-heading-v2">
          <div>
            <div className="eyebrow-label">MEMBERSHIPS</div>
            <h2 className="section-title">
              <IconUsers width={18} height={18} /> Communities
            </h2>
          </div>
          <span className="muted">{communities.length} total</span>
        </div>

        {loadingCommunities && (
          <div className="card muted"><span className="spinner" /> Loading communities…</div>
        )}

        {!loadingCommunities && communities.length === 0 && (
          <div className="card empty-state">
            <h3>No communities yet</h3>
            <p>@{user.username} hasn’t joined any communities.</p>
          </div>
        )}

        {owned.length > 0 && (
          <CommunityGroup label="Owner" accent items={owned} />
        )}
        {modding.length > 0 && (
          <CommunityGroup label="Moderator" accent items={modding} />
        )}
        {joining.length > 0 && (
          <CommunityGroup label="Member" items={joining} />
        )}
      </section>
    </div>
  );
}

function CommunityGroup({ label, items, accent = false }) {
  return (
    <div className="profile-v2-group">
      <div className="profile-v2-group-head">
        <span className={`pill ${accent ? 'role' : ''}`}>{label}</span>
        <span className="muted">{items.length}</span>
      </div>
      <div className="profile-v2-grid">
        {items.map((c) => (
          <CommunityCard key={c.id} community={c} />
        ))}
      </div>
    </div>
  );
}
