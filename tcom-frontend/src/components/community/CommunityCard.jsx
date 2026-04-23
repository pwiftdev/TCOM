import { Link } from 'react-router-dom';

export function CommunityCard({ community }) {
  return (
    <Link to={`/c/${community.slug}`} className="community-card card">
      <div className="community-banner">
        {community.banner_url && <img src={community.banner_url} alt="" />}
      </div>
      <div className="community-card-body">
        <div className="community-card-head">
          <h3>{community.name}</h3>
          <span className="pill">{community.visibility}</span>
        </div>
        <p className="community-card-desc">{community.description || 'No description yet.'}</p>
        {community.contract_address && (
          <p className="community-card-contract" title={community.contract_address}>
            CA: {community.contract_address}
          </p>
        )}
        <div className="community-card-meta">
          <span>{community.member_count ?? 0} members</span>
          <span>·</span>
          <span>{community.post_count ?? 0} posts</span>
        </div>
      </div>
    </Link>
  );
}
