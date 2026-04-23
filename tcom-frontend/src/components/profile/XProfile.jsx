function formatCount(n) { if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`; if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`; return n; }

export function XProfile({ user }) {
  if (!user) return null;
  return (
    <div className="card">
      <img src={user.avatar_url} alt={user.display_name} width={80} height={80} style={{ borderRadius: '9999px' }} />
      <h2>{user.display_name}</h2>
      <p>@{user.username}</p>
      <p>{user.bio}</p>
      <p>{formatCount(user.followers_count)} followers · {formatCount(user.following_count)} following</p>
    </div>
  );
}
