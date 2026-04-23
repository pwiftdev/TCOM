import { Link } from 'react-router-dom';

export function CommunityCard({ community }) {
  return (
    <div className="card">
      <div className="community-card-head">
        <h3>{community.name}</h3>
        <span className="pill">{community.visibility}</span>
      </div>
      <p>{community.description || 'No description yet.'}</p>
      <div className="community-card-meta">
        <span>{community.member_count} members</span>
        <span>{community.post_count} posts</span>
      </div>
      <Link className="btn" to={`/c/${community.slug}`}>Open community</Link>
    </div>
  );
}
