import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/users';
import { Avatar } from '../components/ui/Avatar';

function formatCount(n) {
  if (n == null) return 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n;
}

export default function Profile() {
  const { username } = useParams();
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => userApi.getByUsername(username),
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

  return (
    <div className="container fade-in" style={{ maxWidth: 620 }}>
      <div className="card">
        <div className="profile-header">
          <Avatar size="lg" src={user.avatar_url} name={user.username} />
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: '0 0 0.2rem 0' }}>
              {user.display_name || user.username}
            </h2>
            <p className="muted" style={{ margin: 0 }}>@{user.username}</p>
          </div>
        </div>
        {user.bio && (
          <p style={{ marginTop: '1rem', marginBottom: 0 }}>{user.bio}</p>
        )}
        <div className="profile-stats">
          <span><strong>{formatCount(user.followers_count)}</strong> followers</span>
          <span><strong>{formatCount(user.following_count)}</strong> following</span>
        </div>
      </div>
    </div>
  );
}
