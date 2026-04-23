import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../api/communities';
import { postApi } from '../api/posts';
import { CommunityHeader } from '../components/community/CommunityHeader';
import { PostComposer } from '../components/posts/PostComposer';
import { PostCard } from '../components/posts/PostCard';
import { useAuthStore } from '../store/authStore';

export default function Community() {
  const { slug } = useParams();
  const user = useAuthStore((s) => s.user);

  const { data: community, isLoading: loadingCommunity, isError: communityErr } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => communityApi.get(slug),
    staleTime: 30_000,
  });

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['posts', slug],
    queryFn: () => postApi.listByCommunity(slug),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const postList = posts || [];
  const canPin = Boolean(user && community && community.owner_id === user.id);

  return (
    <div className="container grid fade-in" style={{ maxWidth: 760 }}>
      {loadingCommunity && (
        <div className="card muted">
          <span className="spinner" /> Loading community…
        </div>
      )}
      {communityErr && (
        <div className="card empty-state">
          <h3>Community not found</h3>
          <p>It may have been deleted or set to private.</p>
        </div>
      )}
      {community && <CommunityHeader community={community} />}

      {community && (
        <>
          <PostComposer communitySlug={slug} />

          {loadingPosts && (
            <div className="card muted">
              <span className="spinner" /> Loading posts…
            </div>
          )}

          {!loadingPosts && postList.length === 0 && (
            <div className="card empty-state">
              <h3>No posts yet</h3>
              <p>Start the conversation — share alpha with this community.</p>
            </div>
          )}

          {postList.length > 0 && (
            <div className="grid">
              {postList.map((p) => (
                <PostCard key={p.id} post={p} communitySlug={slug} canPin={canPin} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
