import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../api/communities';

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', visibility: 'public', tags: [] });

  async function onSubmit(e) {
    e.preventDefault();
    const created = await communityApi.create(form);
    navigate(`/c/${created.slug}`);
  }

  return (
    <div className="container">
      <form className="card grid" onSubmit={onSubmit}>
        <h2>Create Community</h2>
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <textarea rows={5} placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <select value={form.visibility} onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value }))}><option value="public">Public</option><option value="private">Private</option><option value="invite">Invite only</option></select>
        <button className="btn" type="submit">Create</button>
      </form>
    </div>
  );
}
