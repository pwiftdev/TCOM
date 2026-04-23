import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { postApi } from '../../api/posts';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { LoginWithX } from '../auth/LoginWithX';

const MAX = 500;

export function PostComposer({ communitySlug, placeholder = 'Share alpha with the community…' }) {
  const [content, setContent] = useState('');
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => postApi.createInCommunity(communitySlug, { content: content.trim() }),
    onSuccess: () => {
      setContent('');
      qc.invalidateQueries({ queryKey: ['posts', communitySlug] });
      qc.invalidateQueries({ queryKey: ['community', communitySlug] });
      toast.success('Posted');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not post'),
  });

  if (!user) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <span className="muted">Sign in with X to post, like, and reply.</span>
        <LoginWithX />
      </div>
    );
  }

  const length = content.length;
  const remaining = MAX - length;
  const warnClass = remaining < 0 ? 'danger' : remaining < 40 ? 'warn' : '';
  const disabled = !content.trim() || remaining < 0 || mutation.isPending;

  function onKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !disabled) {
      mutation.mutate();
    }
  }

  return (
    <div className="composer">
      <Avatar src={user.avatar_url} name={user.username} />
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={3}
          maxLength={600}
        />
        <div className="composer-footer">
          <span className={`char-counter ${warnClass}`}>{remaining}</span>
          <button
            type="button"
            className="btn"
            onClick={() => mutation.mutate()}
            disabled={disabled}
          >
            {mutation.isPending ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
