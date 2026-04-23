export function CommunityHeader({ community, onJoin }) {
  if (!community) return null;
  return (
    <div className="card">
      {community.banner_url && <img src={community.banner_url} alt="banner" style={{ width: '100%', borderRadius: 8 }} />}
      <h2>{community.name}</h2>
      <p>{community.description}</p>
      <p>{community.member_count} members · {community.post_count} posts</p>
      <button className="btn" onClick={onJoin}>Join</button>
    </div>
  );
}
