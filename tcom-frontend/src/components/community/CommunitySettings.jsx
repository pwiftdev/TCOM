import { useState } from 'react';
import { communityApi } from '../../api/communities';

export function CommunitySettings({ community }) {
  const [form, setForm] = useState({ name: community?.name || '', description: community?.description || '', visibility: community?.visibility || 'public' });
  if (!community) return null;
  async function onSubmit(e) { e.preventDefault(); await communityApi.update(community.slug, form); alert('Saved'); }
  return (
    <form className="card grid" onSubmit={onSubmit}>
      <h3>Community Settings</h3>
      <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <textarea rows={5} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      <select value={form.visibility} onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value }))}><option value="public">Public</option><option value="private">Private</option><option value="invite">Invite only</option></select>
      <button className="btn" type="submit">Save</button>
    </form>
  );
}
