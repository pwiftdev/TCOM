import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import { postApi } from '../../api/posts';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { UserXLink } from '../profile/UserXLink';
import { PostBody } from './PostBody';

dayjs.extend(relativeTime);

const MAX = 500;

export function ReplyThread({ postId, communitySlug }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [content, setContent] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postApi.get(postId),
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
  });

  const replyMutation = useMutation({
    mutationFn: () => postApi.reply(postId, { content: content.trim() }),
    onSuccess: () => {
      setContent('');
      qc.invalidateQueries({ queryKey: ['post', postId] });
      qc.invalidateQueries({ queryKey: ['posts', communitySlug] });
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not reply'),
  });

  const replies = data?.replies || [];
  const remaining = MAX - content.length;
  const warnClass = remaining < 0 ? 'danger' : remaining < 40 ? 'warn' : '';
  const disabled = !content.trim() || remaining < 0 || replyMutation.isPending;

  return (
    <div className="replies">
      {isLoading && replies.length === 0 && (
        <div className="muted" style={{ fontSize: '0.85rem' }}>
          <span className="spinner" /> Loading replies…
        </div>
      )}
      {replies.map((reply) => (
        <article className="reply" key={reply.id}>
          <Avatar size="sm" src={reply.users?.avatar_url} name={reply.users?.username} />
          <div className="post-body">
            <header className="post-meta">
              <UserXLink username={reply.users?.username}>
                <strong>{reply.users?.display_name || reply.users?.username || 'Unknown'}</strong>
              </UserXLink>
              <span className="handle">@{reply.users?.username}</span>
              <span className="dot">·</span>
              <time>{dayjs(reply.created_at).fromNow()}</time>
            </header>
            <PostBody text={reply.content} />
            {Array.isArray(reply.media_urls) && reply.media_urls.length > 0 && (
              <div className="post-media-grid media-count-2" style={{ marginTop: '0.45rem' }}>
                {reply.media_urls.slice(0, 2).map((url) => (
                  <a href={url} target="_blank" rel="noreferrer" key={url} className="post-media-item">
                    <img src={url} alt="" loading="lazy" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}

      {user ? (
        <div className="reply-composer">
          <textarea
            rows={2}
            placeholder="Post your reply"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={600}
          />
          <div className="composer-footer" style={{ paddingTop: '0.5rem', marginTop: '0.3rem' }}>
            <span className={`char-counter ${warnClass}`}>{remaining}</span>
            <button
              type="button"
              className="btn"
              onClick={() => replyMutation.mutate()}
              disabled={disabled}
            >
              {replyMutation.isPending ? 'Replying…' : 'Reply'}
            </button>
          </div>
        </div>
      ) : (
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>Sign in to reply.</p>
      )}
    </div>
  );
}
