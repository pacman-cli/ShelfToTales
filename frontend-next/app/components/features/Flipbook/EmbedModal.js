'use client';

import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { buildEmbedCode, copyToClipboard } from '@/utils/flipbook/embedCode';

/**
 * Build & copy an iframe snippet for embedding this flipbook elsewhere.
 *
 * @param {object} props
 * @param {boolean} props.show Whether the modal is open.
 * @param {() => void} props.onHide Close handler.
 * @param {object|null} props.flipbook Flipbook payload.
 * @returns {JSX.Element}
 */
export default function EmbedModal({ show, onHide, flipbook }) {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [allowFullscreen, setAllowFullscreen] = useState(true);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!show) setStatus('idle');
  }, [show]);

  if (!flipbook) return null;

  const code = buildEmbedCode({
    flipbookId: flipbook.id,
    width,
    height,
    allowFullscreen,
  });

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    setStatus(ok ? 'copied' : 'error');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 m-0">Embed this flipbook</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="small text-muted">
          Drop this iframe into a blog post, course page, or Notion embed block.
        </p>
        <div className="row g-2 mb-3">
          <div className="col-6">
            <label htmlFor="fb-embed-width" className="form-label small">Width (px)</label>
            <input
              id="fb-embed-width"
              type="number"
              min={200}
              max={2000}
              className="form-control"
              value={width}
              onChange={(e) => setWidth(Math.max(200, Number(e.target.value) || 0))}
            />
          </div>
          <div className="col-6">
            <label htmlFor="fb-embed-height" className="form-label small">Height (px)</label>
            <input
              id="fb-embed-height"
              type="number"
              min={200}
              max={2000}
              className="form-control"
              value={height}
              onChange={(e) => setHeight(Math.max(200, Number(e.target.value) || 0))}
            />
          </div>
        </div>
        <div className="form-check mb-3">
          <input
            id="fb-embed-fullscreen"
            type="checkbox"
            className="form-check-input"
            checked={allowFullscreen}
            onChange={(e) => setAllowFullscreen(e.target.checked)}
          />
          <label htmlFor="fb-embed-fullscreen" className="form-check-label small">
            Allow fullscreen inside the embed
          </label>
        </div>
        <label htmlFor="fb-embed-code" className="form-label small">Generated code</label>
        <textarea
          id="fb-embed-code"
          className="form-control font-monospace small"
          rows={4}
          readOnly
          value={code}
        />
        <div className="d-flex align-items-center gap-2 mt-3">
          <button type="button" className="btn btn-sm btn-primary" onClick={handleCopy}>
            <i className="fa-regular fa-copy me-1" aria-hidden="true" /> Copy code
          </button>
          <span
            className={`small ${status === 'error' ? 'text-danger' : 'text-success'}`}
            aria-live="polite"
          >
            {status === 'copied' && 'Copied to clipboard.'}
            {status === 'error' && 'Could not copy. Select the code and press ⌘C.'}
          </span>
        </div>
      </Modal.Body>
    </Modal>
  );
}
