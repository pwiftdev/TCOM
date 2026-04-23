import { useState } from 'react';

export function Avatar({ src, name, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || '?').charAt(0).toUpperCase();
  const className = `avatar ${size !== 'md' ? size : ''}`.trim();
  const showImg = src && !failed;
  return (
    <span className={className} aria-hidden="true">
      {showImg ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        initial
      )}
    </span>
  );
}
