'use client';

import React from 'react';
import Link from 'next/link';

function DashboardQuickActions() {
  const actions = [
    { to: '/books', icon: 'fa-solid fa-compass', label: 'Browse Books', color: '#0d6efd' },
    { to: '/shop-cart', icon: 'fa-solid fa-cart-shopping', label: 'View Cart', color: '#198754' },
    { to: '/wishlist', icon: 'fa-solid fa-heart', label: 'Wishlist', color: '#dc3545' },
    { to: '/virtual-bookshelf', icon: 'fa-solid fa-book', label: 'My Bookshelf', color: '#0dcaf0' },
  ];

  return (
    <div className="d-flex gap-2 flex-wrap">
      {actions.map((a, idx) => (
        <Link key={idx} to={a.to}
              className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 rounded-pill">
          <i className={a.icon} style={{ color: a.color }}></i>
          {a.label}
        </Link>
      ))}
    </div>
  );
}

export default DashboardQuickActions;
