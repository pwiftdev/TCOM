import { Fragment } from 'react';

const CASHTAG_REGEX = /\$([A-Za-z][A-Za-z0-9]{0,14})\b/g;

export function PostBody({ text, className = 'post-content' }) {
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  CASHTAG_REGEX.lastIndex = 0;
  while ((match = CASHTAG_REGEX.exec(text)) !== null) {
    const [full, symbol] = match;
    const start = match.index;
    if (start > lastIndex) {
      parts.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex, start)}</Fragment>);
    }
    const href = `https://x.com/search?q=${encodeURIComponent(`$${symbol}`)}&src=cashtag_click`;
    parts.push(
      <a
        key={`c-${key++}`}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="post-cashtag"
        onClick={(e) => e.stopPropagation()}
      >
        {full}
      </a>,
    );
    lastIndex = start + full.length;
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex)}</Fragment>);
  }

  return <p className={className}>{parts}</p>;
}
