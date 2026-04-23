import { Link } from 'react-router-dom';

export function CommunityCard({ community }) {
  return (
    <div className="card">
      <h3>{community.name}</h3>
      <p>{community.description || 'No description'}</p>
      <p>{community.member_count} members</p>
      <Link className="btn" to={`/c/${community.slug}`}>Open</Link>
    </div>
  );
}
