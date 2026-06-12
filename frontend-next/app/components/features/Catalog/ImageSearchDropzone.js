'use client';

import React, { useState } from 'react';
import { searchService } from '../../lib/api';

export default function ImageSearchDropzone({ onResults }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onFile = async (file) => {
    if (!file) return;
    setError(null);
    setLoading(true);
    setPreview(URL.createObjectURL(file));
    try {
      const res = await searchService.imageSearch(file, 10);
      onResults?.(res.data || []);
    } catch (e) {
      setError('Could not search by this image. Try a clearer book cover.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      style={{
        border: '2px dashed #d0d0d0',
        borderRadius: 12,
        padding: 16,
        textAlign: 'center',
        cursor: 'pointer',
        background: '#fafafa',
      }}
      onClick={() => document.getElementById('image-search-input')?.click()}
    >
      <input
        id="image-search-input"
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {preview ? (
        <div>
          <img src={preview} alt="Uploaded cover" style={{ maxHeight: 120, borderRadius: 8 }} />
          <p style={{ fontSize: '0.85rem', marginTop: 8 }}>
            {loading ? 'Searching the catalog…' : 'Click to choose a different image'}
          </p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 28 }} aria-hidden>🖼️</div>
          <p style={{ margin: '8px 0 4px', fontWeight: 500 }}>Drop a book cover here</p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
            or click to upload — we'll find matching titles
          </p>
        </div>
      )}
      {error && <p style={{ color: '#dc3545', marginTop: 8 }}>{error}</p>}
    </div>
  );
}
