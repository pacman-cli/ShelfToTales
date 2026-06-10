'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchService } from '../lib/api';
import './SearchResults.css';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [textResults, setTextResults] = useState([]);
  const [semanticResults, setSemanticResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setTextResults([]);
    setSemanticResults([]);

    const params = {
      q: query,
      page: 0,
      size: 24,
      sortBy: 'title',
      sortDir: 'asc',
    };

    const semanticPromise = searchService
      .semanticSearch(query, 12)
      .then((res) => {
        const results = res.data?.results || [];
        setSemanticResults(
          results.map((r) => ({
            id: r.bookId,
            title: r.title,
            author: r.author,
            coverUrl: r.coverUrl,
            categoryName: r.categoryName,
            score: r.score,
          }))
        );
      })
      .catch(() => {});

    const textPromise = searchService
      .textSearch(params)
      .then((res) => {
        const content = res.data?.content || [];
        setTextResults(
          content.map((b) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            coverUrl: b.coverUrl,
            categoryName: b.categoryName,
            price: b.price,
            score: null,
          }))
        );
      })
      .catch(() => {});

    Promise.all([textPromise, semanticPromise]).finally(() =>
      setLoading(false)
    );
  }, [query]);

  const mergedResults = useMemo(() => {
    const map = new Map();
    for (const book of textResults) {
      map.set(book.id, { ...book, source: 'text' });
    }
    for (const book of semanticResults) {
      if (map.has(book.id)) {
        map.get(book.id).score = book.score;
        map.get(book.id).source = 'both';
      } else {
        map.set(book.id, { ...book, source: 'semantic' });
      }
    }
    return Array.from(map.values());
  }, [textResults, semanticResults]);

  const displayedResults = useMemo(() => {
    if (activeTab === 'semantic') return semanticResults;
    if (activeTab === 'text') return textResults;
    return mergedResults;
  }, [activeTab, textResults, semanticResults, mergedResults]);

  if (!query.trim()) {
    return (
      <div className="sr-page">
        <div className="sr-container">
          <div className="sr-empty">
            <i className="fa-solid fa-magnifying-glass" />
            <h3>Search for books</h3>
            <p>Enter a title, author, ISBN, or description above</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sr-page">
      <div className="sr-container">
        <div className="sr-header">
          <h1>
            Search results for <span className="sr-query">&ldquo;{query}&rdquo;</span>
          </h1>
          <p>
            Found {mergedResults.length} book{mergedResults.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="sr-tabs">
          <button
            className={`sr-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({mergedResults.length})
          </button>
          <button
            className={`sr-tab ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            Title/Author ({textResults.length})
          </button>
          <button
            className={`sr-tab ${activeTab === 'semantic' ? 'active' : ''}`}
            onClick={() => setActiveTab('semantic')}
          >
            Semantic ({semanticResults.length})
          </button>
        </div>

        {loading ? (
          <div className="sr-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="sr-skeleton-card">
                <div className="sr-skel-img" />
                <div className="sr-skel-text" />
                <div className="sr-skel-text short" />
              </div>
            ))}
          </div>
        ) : displayedResults.length > 0 ? (
          <div className="sr-grid">
            {displayedResults.map((book) => (
              <div key={book.id} className="sr-card">
                <div className="sr-card-img">
                  <Link href={`/shop-detail/${book.id}`}>
                    <img
                      src={
                        book.coverUrl ||
                        `https://via.placeholder.com/250x350/EAA451/fff?text=${encodeURIComponent(
                          book.title?.substring(0, 8) || 'Book'
                        )}`
                      }
                      alt={book.title}
                      loading="lazy"
                    />
                  </Link>
                  {book.score != null && (
                    <span className="sr-card-score">
                      {(book.score * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>
                <div className="sr-card-body">
                  <Link
                    href={`/shop-detail/${book.id}`}
                    className="sr-card-title"
                  >
                    {book.title}
                  </Link>
                  <p className="sr-card-author">{book.author}</p>
                  {book.categoryName && (
                    <span className="sr-card-category">
                      {book.categoryName}
                    </span>
                  )}
                  {book.price != null && (
                    <div className="sr-card-price">${book.price}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sr-empty">
            <i className="fa-solid fa-book-open" />
            <h3>No books found</h3>
            <p>Try different keywords or check your spelling</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
