import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { communityApi } from '../api/communities';

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    visibility: 'public',
    tags: [],
  });
  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const created = await communityApi.create({ ...form, name: form.name.trim() });
      toast.success('Community created');
      navigate(`/c/${created.slug}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not create community');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container fade-in" style={{ maxWidth: 620 }}>
      <form className="card grid" onSubmit={onSubmit}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>Create a community</h2>
          <p className="muted" style={{ margin: 0 }}>
            Set up a new space for your crypto tribe.
          </p>
        </div>
        <label>
          <span className="muted">Community name</span>
          <input
            className="input"
            placeholder="Bitcoin Traders"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            maxLength={60}
          />
        </label>
        <label>
          <span className="muted">Description</span>
          <textarea
            rows={4}
            placeholder="What's your community about?"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            maxLength={500}
          />
        </label>
        <label>
          <span className="muted">Visibility</span>
          <select
            value={form.visibility}
            onChange={(e) => update('visibility', e.target.value)}
          >
            <option value="public">Public — anyone can view and join</option>
            <option value="private">Private — members only</option>
            <option value="invite">Invite only</option>
          </select>
        </label>
        <div>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create community'}
          </button>
        </div>
      </form>
    </div>
  );
}
