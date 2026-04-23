import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../api/communities';
import { postApi } from '../api/posts';
import { CommunityHeader } from '../components/community/CommunityHeader';
import { PostComposer } from '../components/posts/PostComposer';
import { PostCard } from '../components/posts/PostCard';
import { useAuthStore } from '../store/authStore';

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'trending', label: 'Trending' },
];

export default function Community() {
  const { slug } = useParams();
  const user = useAuthStore((s) => s.user);
  const [sort, setSort] = useState('latest');

  const { data: community, isLoading: loadingCommunity, isError: communityErr } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => communityApi.get(slug),
    staleTime: 30_000,
  });

  const postsKey = ['posts', slug, sort];
  const { data: posts, isLoading: loadingPosts, isFetching: fetchingPosts } = useQuery({
    queryKey: postsKey,
    queryFn: () => postApi.listByCommunity(slug, { sort }),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const postList = posts || [];
  const canPin = Boolean(user && community && community.owner_id === user.id);
  const canModerate = Boolean(community && ['owner', 'moderator'].includes(community.my_role || ''));

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

          <div className="feed-sort">
            <div className="feed-sort-tabs" role="tablist" aria-label="Sort posts">
              {SORT_OPTIONS.map((opt) => {
                const active = sort === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`feed-sort-tab ${active ? 'active' : ''}`}
                    onClick={() => setSort(opt.id)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {fetchingPosts && !loadingPosts && (
              <span className="muted feed-sort-status"><span className="spinner" /> Updating…</span>
            )}
          </div>

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
                <PostCard
                  key={p.id}
                  post={p}
                  communitySlug={slug}
                  canPin={canPin}
                  canModerate={canModerate}
                  listKey={postsKey}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
