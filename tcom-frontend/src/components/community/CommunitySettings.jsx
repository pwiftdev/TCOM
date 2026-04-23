import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../../api/communities';

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
  const [modUsername, setModUsername] = useState('');
  const [banUsername, setBanUsername] = useState('');
  const [unbanUsername, setUnbanUsername] = useState('');

  if (!community) {
    return (
      <div className="card muted"><span className="spinner" /> Loading…</div>
    );
  }

  const isOwner = community.my_role === 'owner';
  const canModerate = ['owner', 'moderator'].includes(community.my_role || '');

  const membersQuery = useQuery({
    queryKey: ['members', community.slug, 'manage'],
    queryFn: () => communityApi.members(community.slug),
    enabled: canModerate,
    staleTime: 10_000,
  });

  const bansQuery = useQuery({
    queryKey: ['bans', community.slug],
    queryFn: () => communityApi.listBans(community.slug),
    enabled: canModerate,
    staleTime: 10_000,
  });

  const modMutation = useMutation({
    mutationFn: ({ username, action }) => communityApi.setModerator(community.slug, { username, action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', community.slug] });
      qc.invalidateQueries({ queryKey: ['members', community.slug, 'manage'] });
      toast.success('Moderator role updated');
      setModUsername('');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not update moderator'),
  });

  const banMutation = useMutation({
    mutationFn: ({ username }) => communityApi.ban(community.slug, { username }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', community.slug] });
      qc.invalidateQueries({ queryKey: ['members', community.slug, 'manage'] });
      qc.invalidateQueries({ queryKey: ['bans', community.slug] });
      toast.success('User banned');
      setBanUsername('');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not ban user'),
  });

  const unbanMutation = useMutation({
    mutationFn: ({ username }) => communityApi.unban(community.slug, { username }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bans', community.slug] });
      toast.success('User unbanned');
      setUnbanUsername('');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not unban user'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => communityApi.remove(community.slug),
    onSuccess: () => {
      toast.success('Community deleted');
      navigate('/');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Could not delete community'),
  });

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
    <form className="card grid fade-in" onSubmit={onSubmit}>
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
      {canModerate && (
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <h3 style={{ marginTop: 0 }}>Moderation</h3>
          <div className="grid" style={{ gap: '0.6rem' }}>
            <label>
              <span className="muted">Ban member by username</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="input" placeholder="username" value={banUsername} onChange={(e) => setBanUsername(e.target.value)} />
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => banMutation.mutate({ username: banUsername.trim() })}
                  disabled={!banUsername.trim() || banMutation.isPending}
                >
                  Ban
                </button>
              </div>
            </label>
            <label>
              <span className="muted">Unban member by username</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="input" placeholder="username" value={unbanUsername} onChange={(e) => setUnbanUsername(e.target.value)} />
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => unbanMutation.mutate({ username: unbanUsername.trim() })}
                  disabled={!unbanUsername.trim() || unbanMutation.isPending}
                >
                  Unban
                </button>
              </div>
            </label>
            {bansQuery.data?.length > 0 && (
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                Banned: {bansQuery.data.map((b) => `@${b.users?.username}`).filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
      {isOwner && (
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <h3 style={{ marginTop: 0 }}>Owner controls</h3>
          <label>
            <span className="muted">Set moderator by username</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="input" placeholder="username" value={modUsername} onChange={(e) => setModUsername(e.target.value)} />
              <button
                type="button"
                className="btn-ghost"
                onClick={() => modMutation.mutate({ username: modUsername.trim(), action: 'grant' })}
                disabled={!modUsername.trim() || modMutation.isPending}
              >
                Grant mod
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => modMutation.mutate({ username: modUsername.trim(), action: 'revoke' })}
                disabled={!modUsername.trim() || modMutation.isPending}
              >
                Revoke
              </button>
            </div>
          </label>
          {membersQuery.data?.length > 0 && (
            <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Moderators: {membersQuery.data.filter((m) => m.role === 'moderator').map((m) => `@${m.users?.username}`).filter(Boolean).join(', ') || 'none'}
            </div>
          )}
          <div style={{ marginTop: '0.9rem' }}>
            <button
              type="button"
              className="btn-ghost"
              style={{ borderColor: 'var(--danger)', color: '#d47070' }}
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
        </div>
      )}
    </form>
  );
}
