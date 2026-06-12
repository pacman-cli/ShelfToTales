'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BookPreviewPanel({ room, onOpenReader }) {
  const router = useRouter();
  if (!room) return null;

  const hasFlipbook = Boolean(room.flipbookId);
  const hasPdf = Boolean(room.pdfUrl);

  const handleOpenFlipbook = () => {
    if (room.flipbookId) {
      router.push(`/flipbook/${encodeURIComponent(room.flipbookId)}`);
    }
  };

  // Backwards-compatible label: a single "Open Reader" button when the
  // room has a pdfUrl but no dedicated flipbook, matching the previous UX.
  const renderReaderButton = () => {
    if (hasFlipbook) {
      return (
        <button
          className="rp-reader-btn"
          onClick={handleOpenFlipbook}
          aria-label="Open flipbook preview"
        >
          <i className="fa-solid fa-book-open" />
          <span>Open Flipbook</span>
        </button>
      );
    }
    if (hasPdf) {
      return (
        <button
          className="rp-reader-btn"
          onClick={onOpenReader}
          aria-label="Open book reader"
        >
          <i className="fa-solid fa-book-open" />
          <span>Open Reader</span>
        </button>
      );
    }
    return null;
  };

  return (
    <div className="rp-book-panel">
      {room.bookTitle ? (
        <>
          {renderReaderButton()}
          <h2 className="rp-book-title">{room.bookTitle}</h2>
        </>
      ) : (
        <div className="rp-no-book">
          <i className="fa-solid fa-book" />
          <p>No book selected for this room</p>
        </div>
      )}

      <div className="rp-room-info">
        <h3 className="rp-room-name">{room.name}</h3>
        {room.description && (
          <p className="rp-room-desc">{room.description}</p>
        )}
        <div className="rp-room-meta">
          <span>
            <i className="fa-solid fa-user" /> Created by {room.createdBy?.fullName || 'Unknown'}
          </span>
          {room.createdAt && (
            <span>
              <i className="fa-regular fa-calendar" />{' '}
              {new Date(room.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
