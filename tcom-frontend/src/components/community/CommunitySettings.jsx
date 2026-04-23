import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../../api/communities';

export function CommunitySettings({ community }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: community?.name || '',
    description: community?.description || '',
    visibility: community?.visibility || 'public',
  });
  const [saving, setSaving] = useState(false);

  if (!community) {
    return (
      <div className="card muted"><span className="spinner" /> Loading…</div>
    );
  }

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

  return (
    <form className="card grid fade-in" onSubmit={onSubmit}>
      <h2 style={{ margin: 0 }}>Community settings</h2>
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
  );
}
