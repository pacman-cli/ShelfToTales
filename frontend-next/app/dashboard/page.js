'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { useApi } from '../hooks/useApi';
import { dashboardService } from '../lib/api';
import './Dashboard.css';

function GoalRing({ completed, goal }) {
  const pct = Math.min((completed / goal) * 100, 100);
  const r = 50, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="dash-goal-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#eaa451" />
            <stop offset="100%" stopColor="#e58c23" />
          </linearGradient>
        </defs>
        <circle className="ring-bg" cx="60" cy="60" r={r} />
        <circle className="ring-fill" cx="60" cy="60" r={r}
          strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="dash-goal-text">
        <div className="number">{completed}</div>
        <div className="label">of {goal}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data, loading, error, refetch } = useApi(() => dashboardService.getDashboard());

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container" style={{ padding: '4rem 1rem' }}>
          <div className="dash-stats">
            {[1,2,3,4].map(i => (
              <div key={i} className="dash-stat-card dash-animate">
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f0ede8' }} />
                <div style={{ width: '60%', height: 28, borderRadius: 8, background: '#f0ede8', marginTop: 16 }} />
                <div style={{ width: '40%', height: 12, borderRadius: 6, background: '#f0ede8', marginTop: 8 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1a1a2e' }}>Something went wrong</h2>
          <p style={{ color: '#8b8b9e' }}>Could not load your dashboard.</p>
          <button onClick={refetch} className="dash-action-btn" style={{ display: 'inline-flex', margin: '0 auto' }}>
            <i className="fa-solid fa-rotate"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isAdmin = user.role === 'ADMIN';
  const firstName = (data.fullName || 'Reader').split(' ')[0];
  const avatarUrl = data.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName || 'U')}&background=eaa451&color=fff&size=72&bold=true`;

  const stats = [
    { icon: 'fa-book-open', label: 'Reading', value: data.totalBooksReading || 0, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { icon: 'fa-check-circle', label: 'Completed', value: data.totalBooksCompleted || 0, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: 'fa-heart', label: 'Wishlist', value: data.wishlistCount || 0, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { icon: 'fa-cart-shopping', label: 'Cart', value: data.cartItemCount || 0, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ];

  return (
    <div className="dashboard-page">
      <div className="container" style={{ maxWidth: 1200, padding: '0 1.5rem' }}>

        {/* Hero */}
        <div className="dash-hero">
          <div className="dash-hero-inner">
            <img src={avatarUrl} alt="avatar" className="dash-avatar" />
            <div>
              <h1 className="dash-greeting">Welcome back, {firstName}</h1>
              <p className="dash-subtitle">{data.email}</p>
              <span className={`dash-role-badge ${isAdmin ? 'admin' : 'user'}`}>
                <i className={`fa-solid ${isAdmin ? 'fa-shield-halved' : 'fa-user'}`}></i>
                {isAdmin ? 'Admin' : 'Reader'}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="dash-admin-section dash-animate">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', margin: 0 }}>Platform Overview</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '4px 0 0' }}>Admin analytics at a glance</p>
              </div>
              <Link href="/admin/dashboard" className="dash-action-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#eaa451', border: '1px solid rgba(234,164,81,0.3)' }}>
                <i className="fa-solid fa-arrow-right"></i> Full Panel
              </Link>
            </div>
            <div className="dash-admin-stats">
              <div className="dash-admin-stat"><div className="value">{data.totalBooksOwned || 0}</div><div className="label">Total Books</div></div>
              <div className="dash-admin-stat"><div className="value">{data.totalOrders || 0}</div><div className="label">Orders</div></div>
              <div className="dash-admin-stat"><div className="value">{data.totalCategoriesOwned || 0}</div><div className="label">Categories</div></div>
              <div className="dash-admin-stat"><div className="value">{data.totalBookshelves || 0}</div><div className="label">Shelves</div></div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="dash-stats">
          {stats.map((s, i) => (
            <div key={i} className="dash-stat-card dash-animate" style={{ '--accent': s.color }}>
              <div className="dash-stat-icon" style={{ background: s.bg, color: s.color }}>
                <i className={`fa-solid ${s.icon}`}></i>
              </div>
              <div className="dash-stat-value">{s.value}</div>
              <div className="dash-stat-label">{s.label}</div>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 20px 0 80px', background: s.color, opacity: 0.06 }} />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="dash-content">
          {/* Left Column */}
          <div>
            {/* Currently Reading */}
            <div className="dash-card dash-animate">
              <h3 className="dash-card-title">Currently Reading</h3>
              {data.currentlyReading?.length > 0 ? (
                data.currentlyReading.slice(0, 4).map((book, i) => (
                  <div key={i} className="dash-reading-item">
                    <img src={book.coverUrl || '/assets/images/book-placeholder.jpg'} alt={book.title} className="dash-reading-cover" />
                    <div className="dash-reading-info" style={{ flex: 1 }}>
                      <h6>{book.title}</h6>
                      <p>{book.author}</p>
                      <div className="dash-progress-bar">
                        <div className="dash-progress-fill" style={{ width: `${book.progress || 30}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8b8b9e' }}>
                  <i className="fa-solid fa-book-open" style={{ fontSize: '2rem', opacity: 0.3, marginBottom: 8 }}></i>
                  <p style={{ margin: 0 }}>No books in progress</p>
                  <Link href="/books-grid-view" className="dash-action-btn" style={{ display: 'inline-flex', marginTop: 12 }}>
                    <i className="fa-solid fa-plus"></i> Browse Books
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="dash-card dash-animate" style={{ marginTop: '1.5rem' }}>
              <h3 className="dash-card-title">Recent Activity</h3>
              {data.recentActivities?.length > 0 ? (
                data.recentActivities.slice(0, 5).map((act, i) => (
                  <div key={i} className="dash-activity-item">
                    <div className="dash-activity-dot" style={{ background: ['#3b82f6','#10b981','#eaa451','#ef4444','#8b5cf6'][i % 5] }} />
                    <span className="dash-activity-text">{act.description || act.activityType}</span>
                    <span className="dash-activity-time">{act.timeAgo || ''}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#8b8b9e', textAlign: 'center', padding: '1rem' }}>No recent activity</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Streak */}
            <div className="dash-streak-card dash-animate">
              <div className="dash-streak-number">{data.currentStreak || 0}</div>
              <div className="dash-streak-label">Day Streak 🔥</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 12, marginBottom: 0 }}>
                {data.currentStreak > 0 ? 'Keep it going!' : 'Read today to start a streak'}
              </p>
            </div>

            {/* Annual Goal */}
            <div className="dash-goal-card dash-animate" style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '1rem' }}>Annual Goal</h4>
              <GoalRing completed={data.totalBooksCompleted || 0} goal={24} />
              <p style={{ color: '#8b8b9e', fontSize: '0.8rem', marginTop: 8 }}>
                {24 - (data.totalBooksCompleted || 0) > 0
                  ? `${24 - (data.totalBooksCompleted || 0)} more to go!`
                  : '🎉 Goal reached!'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="dash-card dash-animate" style={{ marginTop: '1.5rem' }}>
              <h3 className="dash-card-title">Quick Actions</h3>
              <div className="dash-actions">
                <Link href="/books-grid-view" className="dash-action-btn"><i className="fa-solid fa-compass"></i> Explore</Link>
                <Link href="/shop-cart" className="dash-action-btn"><i className="fa-solid fa-cart-shopping"></i> Cart</Link>
                <Link href="/wishlist" className="dash-action-btn"><i className="fa-solid fa-heart"></i> Wishlist</Link>
                <Link href="/my-profile" className="dash-action-btn"><i className="fa-solid fa-user"></i> Profile</Link>
                {isAdmin && <Link href="/admin/books" className="dash-action-btn"><i className="fa-solid fa-plus"></i> Add Book</Link>}
                {isAdmin && <Link href="/admin/categories" className="dash-action-btn"><i className="fa-solid fa-tags"></i> Categories</Link>}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
