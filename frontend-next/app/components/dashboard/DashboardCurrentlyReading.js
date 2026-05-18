'use client';

import React from 'react';
import Link from 'next/link';

function DashboardCurrentlyReading({ books }) {
  if (!books || books.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="fa-solid fa-book-open fa-2x mb-3"></i>
        <p>No books being read yet. <Link href="/books">Browse books</Link> to start reading.</p>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {books.map((book) => (
        <div className="col-md-4" key={book.bookId}>
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex gap-3 mb-3">
                {book.coverUrl && (
                  <img src={book.coverUrl} alt={book.title}
                       style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
                <div>
                  <h6 className="fw-bold mb-1">{book.title}</h6>
                  <small className="text-muted">{book.author}</small>
                </div>
              </div>
              <div className="progress mb-2" style={{ height: '6px' }}>
                <div className="progress-bar bg-primary" role="progressbar"
                     style={{ width: book.progress ? book.progress + '%' : '0%' }}></div>
              </div>
              <small className="text-muted">Page {book.currentPage}</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardCurrentlyReading;
