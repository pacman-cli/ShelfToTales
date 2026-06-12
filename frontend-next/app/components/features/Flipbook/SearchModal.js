'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { searchFlipbook } from '@/utils/flipbook/searchIndex';

/**
 * Client-side text search across the flipbook. Built on the lightweight
 * scanner in `utils/flipbook/searchIndex.js` so the modal opens instantly
 * without warming a FlexSearch index.
 *
 * @param {object} props
 * @param {boolean} props.show Whether the modal is open.
 * @param {() => void} props.onHide Close handler.
 * @param {object|null} props.flipbook Flipbook payload.
 * @param {(pageIndex: number) => void} props.onJumpToPage Called with a hit's page index.
 * @returns {JSX.Element}
 */
export default function SearchModal({ show, onHide, flipbook, onJumpToPage }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!show) setQuery('');
  }, [show]);

  const hits = useMemo(() => {
    if (!query.trim()) return [];
    return searchFlipbook(flipbook, query, 25);
  }, [query, flipbook]);

  const handleSelect = (pageIndex) => {
    onJumpToPage(pageIndex);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="fb-search-modal">
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 m-0">Search inside this book</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label htmlFor="fb-search-input" className="form-label small text-muted">Find a word or phrase</label>
        <input
          id="fb-search-input"
          type="search"
          className="form-control"
          autoComplete="off"
          spellCheck={false}
          placeholder="Type to search…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />
        <p className="small text-muted mt-2" aria-live="polite">
          {query.trim() === ''
            ? 'Start typing to search across all pages.'
            : `${hits.length} match${hits.length === 1 ? '' : 'es'}`}
        </p>
        {hits.length > 0 && (
          <motion.ul
            className="list-group mt-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {hits.map((hit) => (
              <li key={`${hit.pageIndex}-${hit.pageTitle}`} className="list-group-item">
                <button
                  type="button"
                  className="btn btn-link p-0 text-start w-100 text-decoration-none"
                  onClick={() => handleSelect(hit.pageIndex)}
                  aria-label={`Jump to ${hit.pageTitle}`}
                >
                  <span className="d-block fw-semibold">{hit.pageTitle}</span>
                  <span
                    className="d-block small text-muted"
                    dangerouslySetInnerHTML={{ __html: hit.snippet }}
                  />
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </Modal.Body>
    </Modal>
  );
}
