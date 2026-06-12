'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRecommendations } from '@/hooks/useRecommendations';

export default function RecommendationsPage() {
  const [mood, setMood] = useState('cozy');
  const [bookId, setBookId] = useState('');

  const forYou = useRecommendations({ kind: 'for-you', limit: 8 });
  const byMood = useRecommendations({ kind: 'mood', mood, limit: 8 });
  const similar = useRecommendations({
    kind: 'similar',
    bookId: bookId ? Number(bookId) : null,
    limit: 8,
  });

  return (
    <main className="container py-4">
      <h1 className="h3 mb-1">Recommendations</h1>
      <p className="text-muted small">
        Powered by the ranking service at <code>/api/recommendations/*</code>.
      </p>

      <section className="my-4" aria-label="For you">
        <h2 className="h5">Tailored for you</h2>
        {forYou.loading && <p className="text-muted small">Loading…</p>}
        {forYou.error && <p className="text-danger small">Failed to load: {forYou.error}</p>}
        {!forYou.loading && !forYou.error && forYou.items.length === 0 && (
          <p className="text-muted small">No recommendations yet. Add a few books to your shelves.</p>
        )}
        <ul className="list-unstyled d-flex flex-wrap gap-3">
          {forYou.items.map((rec) => (
            <li key={rec.bookId} className="border rounded p-2" style={{ width: 180 }}>
              <Link href={`/books-detail/${rec.bookId}`} className="d-block fw-semibold">
                {rec.title || `Book #${rec.bookId}`}
              </Link>
              {rec.author && <p className="small text-muted m-0">by {rec.author}</p>}
              {typeof rec.score === 'number' && (
                <p className="small text-muted m-0">match: {(rec.score * 100).toFixed(0)}%</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="my-4" aria-label="By mood">
        <h2 className="h5">By mood</h2>
        <label htmlFor="rec-mood-input" className="form-label small">Mood</label>
        <input
          id="rec-mood-input"
          type="text"
          className="form-control form-control-sm mb-2"
          style={{ maxWidth: 240 }}
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="e.g. cozy, dark, hopeful"
        />
        {byMood.error && <p className="text-danger small">{byMood.error}</p>}
        <ul className="list-unstyled d-flex flex-wrap gap-3">
          {byMood.items.map((rec) => (
            <li key={rec.bookId} className="border rounded p-2" style={{ width: 180 }}>
              <Link href={`/books-detail/${rec.bookId}`} className="d-block fw-semibold">
                {rec.title || `Book #${rec.bookId}`}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="my-4" aria-label="Similar books">
        <h2 className="h5">Similar books</h2>
        <label htmlFor="rec-similar-input" className="form-label small">Book id</label>
        <input
          id="rec-similar-input"
          type="number"
          min="1"
          className="form-control form-control-sm mb-2"
          style={{ maxWidth: 240 }}
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          placeholder="e.g. 42"
        />
        {similar.error && <p className="text-danger small">{similar.error}</p>}
        <ul className="list-unstyled d-flex flex-wrap gap-3">
          {similar.items.map((rec) => (
            <li key={rec.bookId} className="border rounded p-2" style={{ width: 180 }}>
              <Link href={`/books-detail/${rec.bookId}`} className="d-block fw-semibold">
                {rec.title || `Book #${rec.bookId}`}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
