import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { communityApi } from '../api/communities';
import { CommunityCard } from '../components/community/CommunityCard';
import { IconPlus, IconSparkles } from '../components/ui/Icon';
import { useAuthStore } from '../store/authStore';

const VISIBILITY_OPTIONS = [
  { id: 'public', title: 'Public', desc: 'Anyone can view and join. Recommended for open alpha.' },
  { id: 'private', title: 'Private', desc: 'Only members see posts. Great for tighter crews.' },
  { id: 'invite', title: 'Invite only', desc: 'Members join via invite link. Most exclusive.' },
];

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export default function CreateCommunity() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    name: '',
    description: '',
    contract_address: '',
    pump_fun_link: '',
    visibility: 'public',
    tags: [],
  });
  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const slug = useMemo(() => slugify(form.name), [form.name]);

  const previewCommunity = useMemo(() => ({
    id: 'preview',
    slug: slug || 'your-community',
    name: form.name || 'Your community',
    description: form.description || 'Describe your community to give it life.',
    visibility: form.visibility,
    banner_url: null,
    contract_address: form.contract_address || null,
    pump_fun_link: form.pump_fun_link || null,
    member_count: 1,
    post_count: 0,
  }), [form, slug]);

  const canSubmit = form.name.trim().length >= 2 && !saving;
  const descRemaining = 500 - form.description.length;
  const nameRemaining = 60 - form.name.length;

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
    <div className="create-page fade-in">
      <header className="create-page-hero">
        <div className="container create-page-hero-inner">
          <div className="eyebrow-label">NEW COMMUNITY</div>
          <h1 className="create-page-title">
            Launch a <span>home</span> for your tribe.
          </h1>
          <p className="create-page-sub">
            Set the name, drop the vibe, link your contract. You can always edit this later.
          </p>
        </div>
      </header>

      <div className="container create-page-grid">
        <form className="create-form" onSubmit={onSubmit}>
          <Fieldset eyebrow="01" title="Identity" desc="The name and elevator pitch your community shows the world.">
            <label className="field">
              <div className="field-head">
                <span>Community name</span>
                <span className={`field-counter ${nameRemaining < 10 ? 'warn' : ''}`}>{nameRemaining}</span>
              </div>
              <input
                className="input"
                placeholder="e.g. Bitcoin Traders"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                maxLength={60}
                autoFocus
              />
              {form.name && (
                <div className="field-hint">
                  URL: <code>tcom.app/c/{slug || '…'}</code>
                </div>
              )}
            </label>
            <label className="field">
              <div className="field-head">
                <span>Description</span>
                <span className={`field-counter ${descRemaining < 40 ? 'warn' : ''}`}>{descRemaining}</span>
              </div>
              <textarea
                rows={4}
                placeholder="What's your community about? What's the alpha?"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                maxLength={500}
              />
            </label>
          </Fieldset>

          <Fieldset eyebrow="02" title="Token" desc="Optional — attach your token's contract and pump.fun link.">
            <label className="field">
              <div className="field-head">
                <span>Contract address</span>
                <span className="muted">Optional</span>
              </div>
              <input
                className="input mono"
                placeholder="0x… or Solana address"
                value={form.contract_address}
                onChange={(e) => update('contract_address', e.target.value)}
                maxLength={140}
              />
            </label>
            <label className="field">
              <div className="field-head">
                <span>Pump.fun link</span>
                <span className="muted">Optional</span>
              </div>
              <input
                className="input"
                placeholder="https://pump.fun/coin/…"
                value={form.pump_fun_link}
                onChange={(e) => update('pump_fun_link', e.target.value)}
                maxLength={300}
              />
            </label>
          </Fieldset>

          <Fieldset eyebrow="03" title="Privacy" desc="Who can view and join your community.">
            <div className="radio-cards">
              {VISIBILITY_OPTIONS.map((opt) => {
                const selected = form.visibility === opt.id;
                return (
                  <label key={opt.id} className={`radio-card ${selected ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.id}
                      checked={selected}
                      onChange={() => update('visibility', opt.id)}
                    />
                    <div className="radio-card-bullet" aria-hidden="true">
                      <span />
                    </div>
                    <div className="radio-card-body">
                      <strong>{opt.title}</strong>
                      <span>{opt.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </Fieldset>

          <div className="create-form-submit">
            <button className="btn btn-lg" type="submit" disabled={!canSubmit}>
              {saving ? (
                <><span className="spinner" /> Creating…</>
              ) : (
                <><IconPlus width={14} height={14} /> Create community</>
              )}
            </button>
            {!user && <span className="muted">Sign in first to save your community.</span>}
          </div>
        </form>

        <aside className="create-preview">
          <div className="create-preview-head">
            <div className="eyebrow-label">LIVE PREVIEW</div>
            <div className="create-preview-hint">
              <IconSparkles width={14} height={14} /> Updates as you type
            </div>
          </div>
          <div className="create-preview-card">
            <CommunityCard community={previewCommunity} />
          </div>
          <ul className="create-tips">
            <li><strong>Short names win.</strong> Keep it iconic — think ticker, not paragraph.</li>
            <li><strong>First line matters.</strong> Your description is the pitch on /explore.</li>
            <li><strong>Attach the token.</strong> CA + Pump.fun boost trust instantly.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function Fieldset({ eyebrow, title, desc, children }) {
  return (
    <fieldset className="create-fieldset">
      <div className="create-fieldset-head">
        <span className="create-fieldset-eyebrow">{eyebrow}</span>
        <div>
          <h3>{title}</h3>
          <p className="muted">{desc}</p>
        </div>
      </div>
      <div className="create-fieldset-body">{children}</div>
    </fieldset>
  );
}
