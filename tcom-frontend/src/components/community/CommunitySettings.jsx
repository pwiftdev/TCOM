import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../../api/communities';
import { MemberManager } from './MemberManager';

export function CommunitySettings({ community }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: community?.name || '',
    description: community?.description || '',
    contract_address: community?.contract_address || '',
    pump_fun_link: community?.pump_fun_link || '',
    visibility: community?.visibility || 'public',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => communityApi.remove(community?.slug),
    onSuccess: () => {
      toast.success('Community deleted');
      navigate('/');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not delete community'),
  });

  if (!community) {
    return (
      <div className="card muted"><span className="spinner" /> Loading…</div>
    );
  }

  const isOwner = community.my_role === 'owner';
  const canModerate = ['owner', 'moderator'].includes(community.my_role || '');

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await communityApi.update(community.slug, form);
      qc.invalidateQueries({ queryKey: ['community', community.slug] });
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function onBannerPick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setUploadingBanner(true);
    try {
      await communityApi.uploadBanner(community.slug, file);
      await qc.invalidateQueries({ queryKey: ['community', community.slug] });
      await qc.invalidateQueries({ queryKey: ['communities'] });
      toast.success('Banner updated');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not upload banner');
    } finally {
      setUploadingBanner(false);
    }
  }

  return (
    <div className="grid fade-in" style={{ gap: '1rem' }}>
      <form className="card grid" onSubmit={onSubmit} style={{ gap: '0.9rem' }}>
        <h2 style={{ margin: 0 }}>Community settings</h2>
        <div className="settings-banner-block">
          <span className="muted">Community banner</span>
          <div className="settings-banner-preview">
            {community.banner_url ? (
              <img src={community.banner_url} alt={`${community.name} banner`} />
            ) : (
              <div className="settings-banner-fallback muted">No banner uploaded yet</div>
            )}
          </div>
          <label className="btn-ghost media-upload-btn">
            {uploadingBanner ? 'Uploading…' : 'Upload banner'}
            <input
              type="file"
              accept="image/*"
              onChange={onBannerPick}
              disabled={uploadingBanner}
            />
          </label>
        </div>
        <label>
          <span className="muted">Name</span>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <label>
          <span className="muted">Description</span>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <label>
          <span className="muted">Contract address (Optional)</span>
          <input
            className="input"
            value={form.contract_address}
            onChange={(e) => setForm((f) => ({ ...f, contract_address: e.target.value }))}
            placeholder="0x..."
            maxLength={140}
          />
        </label>
        <label>
          <span className="muted">Pump.fun Link (Optional)</span>
          <input
            className="input"
            value={form.pump_fun_link}
            onChange={(e) => setForm((f) => ({ ...f, pump_fun_link: e.target.value }))}
            placeholder="https://pump.fun/coin/..."
            maxLength={300}
          />
        </label>
        <label>
          <span className="muted">Visibility</span>
          <select
            value={form.visibility}
            onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value }))}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="invite">Invite only</option>
          </select>
        </label>
        <div>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      {canModerate && (
        <div className="card">
          <MemberManager community={community} />
        </div>
      )}

      {isOwner && (
        <div className="card danger-card">
          <h3 style={{ marginTop: 0 }}>Danger zone</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Deleting the community will permanently remove all posts, replies, and memberships. This cannot be undone.
          </p>
          <button
            type="button"
            className="btn-ghost btn-danger"
            onClick={() => {
              if (window.confirm(`Delete ${community.name}? This cannot be undone.`)) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete community'}
          </button>
        </div>
      )}
    </div>
  );
}
