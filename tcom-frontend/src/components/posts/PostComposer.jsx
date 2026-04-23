import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { postApi } from '../../api/posts';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { LoginWithX } from '../auth/LoginWithX';
import { IconTrash, IconImage, IconSmile } from '../ui/Icon';

const MAX = 500;

export function PostComposer({ communitySlug, placeholder = 'Share alpha with the community…' }) {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);
  const emojiWrapperRef = useRef(null);
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

  useEffect(() => {
    if (!emojiOpen) return;
    function onDocClick(e) {
      if (!emojiWrapperRef.current) return;
      if (!emojiWrapperRef.current.contains(e.target)) setEmojiOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setEmojiOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [emojiOpen]);

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
  const percent = Math.min(100, Math.max(0, (length / MAX) * 100));
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

  function insertEmoji(emojiData) {
    const emoji = emojiData?.emoji;
    if (!emoji) return;
    const el = textareaRef.current;
    if (el && typeof el.selectionStart === 'number') {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = content.slice(0, start) + emoji + content.slice(end);
      setContent(next);
      requestAnimationFrame(() => {
        el.focus();
        const caret = start + emoji.length;
        el.setSelectionRange(caret, caret);
      });
    } else {
      setContent((c) => c + emoji);
    }
  }

  return (
    <div className={`composer composer-x ${focused ? 'is-focused' : ''}`}>
      <Avatar src={user.avatar_url} name={user.username} />
      <div className="composer-main">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={3}
          maxLength={600}
        />
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
        <div className="composer-footer composer-footer-x">
          <div className="composer-action-row">
            <label className="composer-action-icon" title="Upload photo" aria-label="Upload photo">
              <IconImage width={18} height={18} />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPickFiles}
                disabled={uploadMutation.isPending || mediaUrls.length >= 4}
              />
            </label>
            <div className="emoji-wrapper" ref={emojiWrapperRef}>
              <button
                type="button"
                className={`composer-action-icon ${emojiOpen ? 'is-active' : ''}`}
                onClick={() => setEmojiOpen((v) => !v)}
                aria-label="Add emoji"
                aria-expanded={emojiOpen}
                title="Add emoji"
              >
                <IconSmile width={18} height={18} />
              </button>
              {emojiOpen && (
                <div className="emoji-popover" role="dialog" aria-label="Emoji picker">
                  <EmojiPicker
                    onEmojiClick={insertEmoji}
                    theme={Theme.DARK}
                    emojiStyle={EmojiStyle.NATIVE}
                    lazyLoadEmojis
                    searchPlaceholder="Search emoji…"
                    width={320}
                    height={380}
                    previewConfig={{ showPreview: false }}
                    skinTonesDisabled
                  />
                </div>
              )}
            </div>
          </div>
          <div className="composer-submit-group">
            <div className="char-ring-wrap" aria-hidden={remaining >= 40}>
              <svg className={`char-ring ${warnClass}`} viewBox="0 0 24 24" width="22" height="22">
                <circle cx="12" cy="12" r="10" fill="none" stroke="var(--surface-3)" strokeWidth="2.2" />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeDasharray={`${(percent / 100) * 62.83} 62.83`}
                  transform="rotate(-90 12 12)"
                />
              </svg>
              {remaining < 40 && (
                <span className={`char-counter ${warnClass}`}>{remaining}</span>
              )}
            </div>
            <button
              type="button"
              className="btn composer-post-btn"
              onClick={() => mutation.mutate()}
              disabled={disabled}
            >
              {mutation.isPending ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
