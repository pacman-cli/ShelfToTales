'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/utils/flipbook/embedCode';

/**
 * Header row with title, follow / like / embed / share / text-mode controls.
 * Share tries the Web Share API first and falls back to copying the URL.
 *
 * @param {object} props
 * @param {object|null} props.flipbook
 * @param {boolean} props.textMode
 * @param {() => void} props.onToggleTextMode
 * @param {() => void} props.onOpenEmbed
 * @returns {JSX.Element|null}
 */
export default function FlipbookActions({ flipbook, textMode, onToggleTextMode, onOpenEmbed }) {
  const [following, setFollowing] = useState(false);
  const [favorites, setFavorites] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [shareStatus, setShareStatus] = useState('idle');

  if (!flipbook) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/flipbook/${encodeURIComponent(flipbook.id)}`
    : `/flipbook/${encodeURIComponent(flipbook.id)}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: flipbook.title,
          text: flipbook.description,
          url: shareUrl,
        });
        setShareStatus('shared');
        return;
      } catch (err) {
        // User cancelled or share unavailable; fall through to copy.
      }
    }
    const ok = await copyToClipboard(shareUrl);
    setShareStatus(ok ? 'copied' : 'error');
  };

  return (
    <div className="fb-actions d-flex flex-wrap align-items-center gap-2 p-2 bg-light border-bottom">
      <div className="me-auto d-flex align-items-center gap-2 min-w-0">
        <h1 className="h6 m-0 text-truncate" title={flipbook.title}>{flipbook.title}</h1>
        {flipbook.author && (
          <span className="small text-muted text-truncate" title={flipbook.author}>
            by {flipbook.author}
          </span>
        )}
      </div>
      <button
        type="button"
        className={`btn btn-sm ${following ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => setFollowing((value) => !value)}
        aria-pressed={following}
      >
        <i className="fa-solid fa-user-plus me-1" aria-hidden="true" />
        {following ? 'Following' : 'Follow'}
      </button>
      <button
        type="button"
        className={`btn btn-sm ${favorited ? 'btn-warning text-white' : 'btn-outline-secondary'}`}
        onClick={() => {
          setFavorited((value) => !value);
          setFavorites((count) => count + (favorited ? -1 : 1));
        }}
        aria-pressed={favorited}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <i className={`fa${favorited ? '-solid' : '-regular'} fa-star me-1`} aria-hidden="true" />
        {favorites}
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={onOpenEmbed}
        aria-label="Embed"
      >
        <i className="fa-solid fa-code" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={handleShare}
        aria-label="Share"
      >
        <i className="fa-solid fa-share-nodes" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`btn btn-sm ${textMode ? 'btn-secondary' : 'btn-outline-secondary'}`}
        onClick={onToggleTextMode}
        aria-pressed={textMode}
        aria-label="Toggle text version"
      >
        <i className="fa-solid fa-font" aria-hidden="true" />
      </button>
      <span className="visually-hidden" aria-live="polite">
        {shareStatus === 'copied' && 'Link copied to clipboard'}
        {shareStatus === 'shared' && 'Shared'}
        {shareStatus === 'error' && 'Could not share or copy link'}
      </span>
    </div>
  );
}
