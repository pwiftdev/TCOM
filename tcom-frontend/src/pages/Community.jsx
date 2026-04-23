import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../api/communities';
import { postApi } from '../api/posts';
import { CommunityHeader } from '../components/community/CommunityHeader';
import { PostComposer } from '../components/posts/PostComposer';
import { PostCard } from '../components/posts/PostCard';
import { useJoinCommunity } from '../hooks/useCommunity';
import { useAuthStore } from '../store/authStore';

export default function Community() {
  const { slug } = useParams();
  const user = useAuthStore((s) => s.user);
  const { data: community, isLoading: communityLoading } = useQuery({ queryKey: ['community', slug], queryFn: () => communityApi.get(slug) });
  const { data: posts, isLoading: postsLoading } = useQuery({ queryKey: ['posts', slug], queryFn: () => postApi.listByCommunity(slug) });
  const { data: members } = useQuery({ queryKey: ['members', slug], queryFn: () => communityApi.members(slug) });
  const joinMutation = useJoinCommunity(slug);
  const postList = posts || [];
  const memberList = members || [];
  const isOwner = user && community && community.owner_id === user.id;

  return (
    <div className="container grid">
      {communityLoading ? (
        <div className="card muted">Loading community...</div>
      ) : (
        <CommunityHeader community={community} onJoin={() => joinMutation.mutate()} />
      )}

      <div className="grid grid-2">
        <section className="grid">
          <div className="section-title-row">
            <h2>Feed</h2>
            {isOwner && <Link className="btn btn-ghost" to={`/c/${slug}/settings`}>Community settings</Link>}
          </div>
          {user ? (
            <PostComposer communitySlug={slug} />
          ) : (
            <div className="card muted">Log in with X to post and interact.</div>
          )}
          {postsLoading && <div className="card muted">Loading posts...</div>}
          {!postsLoading && postList.length === 0 && (
            <div className="card empty-state">
              <h3>No posts yet</h3>
              <p>Kick things off with the first post in this community.</p>
            </div>
          )}
          <div className="grid">
            {postList.map((post) => <PostCard key={post.id} post={post} communitySlug={slug} />)}
          </div>
        </section>

        <aside className="card">
          <h3>Members</h3>
          <p className="muted">{memberList.length} total</p>
          <div className="member-list">
            {memberList.slice(0, 15).map((entry, idx) => (
              <div className="member-row" key={`${entry.users?.username || 'member'}-${idx}`}>
                <span>@{entry.users?.username || 'unknown'}</span>
                <span className="muted">{entry.role}</span>
              </div>
            ))}
            {memberList.length === 0 && <p className="muted">No members listed yet.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
