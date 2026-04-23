import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import { postApi } from '../../api/posts';
import { Avatar } from '../ui/Avatar';
import { LikeButton } from './LikeButton';
import { ReplyThread } from './ReplyThread';
import { IconReply, IconTrash, IconEye } from '../ui/Icon';
import { useAuthStore } from '../../store/authStore';
import { UserXLink } from '../profile/UserXLink';
import { PostBody } from './PostBody';

dayjs.extend(relativeTime);

const viewedThisSession = new Set();

function formatViews(n) {
  if (!n) return 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n;
}

function PostMedia({ urls }) {
  if (!Array.isArray(urls) || urls.length === 0) return null;
  return (
    <div className={`post-media-grid media-count-${Math.min(urls.length, 4)}`}>
      {urls.slice(0, 4).map((url) => (
        <a href={url} target="_blank" rel="noreferrer" key={url} className="post-media-item">
          <img src={url} alt="" loading="lazy" />
        </a>
      ))}
    </div>
  );
}

export function PostCard({ post, communitySlug, canPin = false, canModerate = false, listKey }) {
  const [showReplies, setShowReplies] = useState(false);
  const [localViews, setLocalViews] = useState(post.view_count || 0);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const articleRef = useRef(null);

  useEffect(() => {
    setLocalViews(post.view_count || 0);
  }, [post.view_count]);

  useEffect(() => {
    if (!post?.id) return undefined;
    if (viewedThisSession.has(post.id)) return undefined;
    const node = articleRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    let fired = false;
    let visibleTimer = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (fired) return;
            clearTimeout(visibleTimer);
            visibleTimer = setTimeout(() => {
              if (fired || viewedThisSession.has(post.id)) return;
              fired = true;
              viewedThisSession.add(post.id);
              setLocalViews((v) => v + 1);
              postApi.view(post.id).catch(() => {
                viewedThisSession.delete(post.id);
              });
              observer.disconnect();
            }, 800);
          } else {
            clearTimeout(visibleTimer);
          }
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(node);
    return () => {
      clearTimeout(visibleTimer);
      observer.disconnect();
    };
  }, [post?.id]);

  const remove = useMutation({
    mutationFn: () => postApi.remove(post.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts', communitySlug] });
      toast.success('Post deleted');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not delete'),
  });
  const pin = useMutation({
    mutationFn: (nextPinned) => postApi.pin(post.id, nextPinned),
    onSuccess: (_data, nextPinned) => {
      qc.invalidateQueries({ queryKey: ['posts', communitySlug] });
      toast.success(nextPinned ? 'Pinned to top' : 'Unpinned');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not update pin'),
  });

  const canDelete = Boolean(user && (post.author_id === user.id || canModerate));
  const replyCount = post.reply_count || 0;

  function handleReplyClick() {
    if (!user && replyCount === 0) {
      toast('Sign in with X to reply');
      return;
    }
    setShowReplies((v) => !v);
  }

  return (
    <article className="post" ref={articleRef}>
      <Avatar src={post.users?.avatar_url} name={post.users?.username || '?'} />
      <div className="post-body">
        <header className="post-meta">
          {post.is_pinned && <span className="pill pin-pill">Pinned</span>}
          <UserXLink username={post.users?.username}>
            <strong>{post.users?.display_name || post.users?.username || 'Unknown'}</strong>
          </UserXLink>
          {post.author_role === 'moderator' && <span className="pill role">Moderator</span>}
          {post.author_role === 'owner' && <span className="pill role">Owner</span>}
          <span className="handle">@{post.users?.username || 'unknown'}</span>
          <span className="dot">·</span>
          <time title={dayjs(post.created_at).format('MMM D, YYYY HH:mm')}>
            {dayjs(post.created_at).fromNow()}
          </time>
        </header>
        <PostBody text={post.content} />
        <PostMedia urls={post.media_urls} />
        <div className="post-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={handleReplyClick}
            aria-label="Reply"
            aria-expanded={showReplies}
          >
            <IconReply width={16} height={16} />
            <span>{replyCount}</span>
          </button>
          <LikeButton post={post} communitySlug={communitySlug} listKey={listKey} />
          <span
            className="btn-icon views-stat"
            aria-label={`${localViews} views`}
            title={`${localViews.toLocaleString()} ${localViews === 1 ? 'view' : 'views'}`}
          >
            <IconEye width={16} height={16} />
            <span>{formatViews(localViews)}</span>
          </span>
          {canPin && (
            <button
              type="button"
              className={`btn-icon ${post.is_pinned ? 'liked' : ''}`}
              onClick={() => pin.mutate(!post.is_pinned)}
              aria-label={post.is_pinned ? 'Unpin post' : 'Pin post'}
              disabled={pin.isPending}
            >
              <span>{post.is_pinned ? 'Unpin' : 'Pin'}</span>
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="btn-icon danger"
              onClick={() => {
                if (window.confirm('Delete this post?')) remove.mutate();
              }}
              aria-label="Delete"
              disabled={remove.isPending}
            >
              <IconTrash width={16} height={16} />
            </button>
          )}
        </div>
        {showReplies && <ReplyThread postId={post.id} communitySlug={communitySlug} />}
      </div>
    </article>
  );
}
