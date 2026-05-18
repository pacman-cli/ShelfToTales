'use client';

import React from 'react';

function DashboardCategoryBreakdown({ categories }) {
  if (!categories || categories.length === 0) {
    return <p className="text-muted text-center py-3">No books in your library yet.</p>;
  }

  const total = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <ul className="list-group list-group-flush">
      {categories.map((cat, idx) => (
        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
          <span>{cat.category}</span>
          <div className="d-flex align-items-center gap-2">
            <div className="progress" style={{ width: '100px', height: '8px' }}>
              <div className="progress-bar" role="progressbar"
                   style={{ width: total > 0 ? (cat.count / total * 100) + '%' : '0%' }}></div>
            </div>
            <small className="fw-bold text-muted">{cat.count}</small>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default DashboardCategoryBreakdown;
