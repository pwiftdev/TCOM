import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import { postApi } from '../../api/posts';
import { Avatar } from '../ui/Avatar';
import { LikeButton } from './LikeButton';
import { ReplyThread } from './ReplyThread';
import { IconReply, IconTrash } from '../ui/Icon';
import { useAuthStore } from '../../store/authStore';

dayjs.extend(relativeTime);

export function PostCard({ post, communitySlug }) {
  const [showReplies, setShowReplies] = useState(false);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const remove = useMutation({
    mutationFn: () => postApi.remove(post.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts', communitySlug] });
      toast.success('Post deleted');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not delete'),
  });

  const canDelete = user && post.author_id === user.id;
  const replyCount = post.reply_count || 0;

  function handleReplyClick() {
    if (!user && replyCount === 0) {
      toast('Sign in with X to reply');
      return;
    }
    setShowReplies((v) => !v);
  }

  return (
    <article className="post">
      <Avatar src={post.users?.avatar_url} name={post.users?.username || '?'} />
      <div className="post-body">
        <header className="post-meta">
          <Link to={`/profile/${post.users?.username || ''}`}>
            <strong>{post.users?.display_name || post.users?.username || 'Unknown'}</strong>
          </Link>
          <span className="handle">@{post.users?.username || 'unknown'}</span>
          <span className="dot">·</span>
          <time title={dayjs(post.created_at).format('MMM D, YYYY HH:mm')}>
            {dayjs(post.created_at).fromNow()}
          </time>
        </header>
        <p className="post-content">{post.content}</p>
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
          <LikeButton post={post} communitySlug={communitySlug} />
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
