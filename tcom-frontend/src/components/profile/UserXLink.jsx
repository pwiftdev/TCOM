import { useState } from 'react';
import { Dialog } from '../ui/Dialog';

export function UserXLink({ username, children, closeParent }) {
  const [open, setOpen] = useState(false);

  function onOpenX() {
    if (!username) return;
    window.open(`https://x.com/${username}`, '_blank', 'noopener,noreferrer');
    setOpen(false);
    if (closeParent) closeParent();
  }

  if (!username) return children || null;

  return (
    <>
      <button
        type="button"
        className="user-x-link-btn"
        onClick={() => setOpen(true)}
      >
        {children || `@${username}`}
      </button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Check X of this user?"
        description={`@${username}`}
      >
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={onOpenX}>
            Open X
          </button>
        </div>
      </Dialog>
    </>
  );
}
