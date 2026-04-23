import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { postApi } from '../../api/posts';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { LoginWithX } from '../auth/LoginWithX';
import { IconTrash } from '../ui/Icon';

const MAX = 500;

export function PostComposer({ communitySlug, placeholder = 'Share alpha with the community…' }) {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => postApi.createInCommunity(communitySlug, { content: content.trim(), media_urls: mediaUrls }),
    onSuccess: () => {
      setContent('');
      setMediaUrls([]);
      qc.invalidateQueries({ queryKey: ['posts', communitySlug] });
      qc.invalidateQueries({ queryKey: ['community', communitySlug] });
      toast.success('Posted');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not post'),
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => postApi.uploadMedia(file),
    onSuccess: ({ url }) => {
      setMediaUrls((prev) => [...prev, url].slice(0, 4));
      toast.success('Image added');
    },
    onError: (err) => toast.error(err?.message || err?.response?.data?.error || 'Could not upload image'),
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
  const disabled = (!content.trim() && mediaUrls.length === 0) || remaining < 0 || mutation.isPending;

  function onKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !disabled) {
      mutation.mutate();
    }
  }

  async function onPickFiles(e) {
    const files = Array.from(e.target.files || []);
    const availableSlots = Math.max(0, 4 - mediaUrls.length);
    const selected = files.slice(0, availableSlots);
    for (const file of selected) {
      await uploadMutation.mutateAsync(file);
    }
    e.target.value = '';
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
        <div className="composer-tools">
          <label className="btn-ghost media-upload-btn">
            Upload photo
            <input type="file" accept="image/*" multiple onChange={onPickFiles} disabled={uploadMutation.isPending || mediaUrls.length >= 4} />
          </label>
        </div>
        {mediaUrls.length > 0 && (
          <div className="media-preview-grid">
            {mediaUrls.map((url) => (
              <div className="media-preview-item" key={url}>
                <img src={url} alt="" />
                <button
                  type="button"
                  className="btn-icon danger media-remove-btn"
                  onClick={() => setMediaUrls((prev) => prev.filter((u) => u !== url))}
                  aria-label="Remove media"
                >
                  <IconTrash width={14} height={14} />
                </button>
              </div>
            ))}
          </div>
        )}
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
