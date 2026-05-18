'use client';

import React from 'react';

const activityIcons = {
  READING_UPDATED: 'fa-solid fa-book-open text-primary',
  CART_ADDED: 'fa-solid fa-cart-plus text-success',
  WISHLIST_ADDED: 'fa-solid fa-heart text-danger',
};

function DashboardRecentActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return <p className="text-muted text-center py-3">No recent activity.</p>;
  }

  return (
    <ul className="list-group list-group-flush">
      {activities.map((act, idx) => (
        <li key={idx} className="list-group-item border-0 d-flex align-items-center gap-3 px-0">
          <i className={activityIcons[act.type] || 'fa-solid fa-circle text-secondary'}></i>
          <div className="flex-grow-1">
            <small>{act.message}</small>
          </div>
          <small className="text-muted">{new Date(act.timestamp).toLocaleDateString()}</small>
        </li>
      ))}
    </ul>
  );
}

export default DashboardRecentActivity;
