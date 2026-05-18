'use client';

import React from 'react';

function DashboardStatCard({ icon, label, value, color, trend }) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div className="rounded-circle d-flex align-items-center justify-content-center text-white"
             style={{ width: '50px', height: '50px', backgroundColor: color || '#0d6efd' }}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div>
          <small className="text-muted d-block">{label}</small>
          <h4 className="fw-bold mb-0">{value}</h4>
          {trend && <small className="text-success">{trend}</small>}
        </div>
      </div>
    </div>
  );
}

export default DashboardStatCard;
