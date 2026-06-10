'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { donationService, exchangeService } from '../lib/api';
import Swal from 'sweetalert2';
import ClientOnly from '../components/ClientOnly';
import './Donations.css';

function DiscoverDonationsInner() {
  const [activeTab, setActiveTab] = useState('donations');
  const [donations, setDonations] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'donations') {
        const res = await donationService.getAvailable();
        setDonations(res.data?.content || res.data || []);
      } else {
        const res = await exchangeService.getListings();
        setSwaps(res.data?.content || res.data || []);
      }
    } catch (err) {
      console.error('Failed to load Giving Economy items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleRequestDonation = async (donation) => {
    const bookTitle = donation.bookTitle || donation.customTitle || 'this book';
    const { value: reason } = await Swal.fire({
      title: 'Request Book Donation',
      html: `
        <div style="text-align: left; font-size: 0.9rem; color: #555;">
          <p>You are requesting <strong>${bookTitle}</strong> from <strong>${donation.donorName}</strong>.</p>
          <p>Please provide a short message explaining why you'd like this book. The donor will review your message before approving.</p>
        </div>
      `,
      input: 'textarea',
      inputPlaceholder: 'Type your message to the donor here…',
      inputAttributes: {
        'aria-label': 'Type your message to the donor here',
        'autocomplete': 'off',
        'rows': '4'
      },
      showCancelButton: true,
      confirmButtonText: 'Send Request',
      confirmButtonColor: '#eaa451',
      cancelButtonColor: '#c9c5c0',
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage('Please write a message/reason for the donor');
        }
        return value;
      }
    });

    if (reason) {
      try {
        await donationService.request(donation.id, reason);
        await Swal.fire({
          icon: 'success',
          title: 'Request Sent!',
          text: 'Your request has been successfully sent to the donor.',
          confirmButtonColor: '#eaa451',
        });
        fetchData();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Failed to submit request', 'error');
      }
    }
  };

  const handleRequestSwap = async (swap) => {
    const isSwapType = swap.type === 'SWAP';
    let htmlContent = `
      <div style="text-align: left; font-size: 0.9rem; color: #555; margin-bottom: 10px;">
        <p>Requesting <strong>${swap.book?.title || 'Book'}</strong> from <strong>${swap.user?.fullName || 'Owner'}</strong>.</p>
      </div>
    `;
    if (isSwapType) {
      htmlContent += `
        <div style="text-align: left; margin-bottom: 10px;">
          <label style="font-weight: 600; font-size: 0.85rem;">Offered Book ID (from your bookshelf):</label>
          <input id="offeredBookIdInput" type="number" placeholder="Enter book ID to offer in return…" class="swal2-input" style="width: 80%; margin: 5px 0;" />
        </div>
      `;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Request Peer Exchange',
      html: htmlContent + `
        <div style="text-align: left;">
          <label style="font-weight: 600; font-size: 0.85rem;">Message:</label>
          <textarea id="swapMessageInput" class="swal2-textarea" placeholder="Add a message to the lister…" style="width: 90%; margin: 5px 0;"></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Submit Request',
      confirmButtonColor: '#eaa451',
      cancelButtonColor: '#c9c5c0',
      preConfirm: () => {
        const message = document.getElementById('swapMessageInput')?.value || '';
        const offeredBookId = isSwapType ? document.getElementById('offeredBookIdInput')?.value : null;
        if (isSwapType && !offeredBookId) {
          Swal.showValidationMessage('Please specify offered book ID for swap');
          return false;
        }
        return { message, offeredBookId };
      }
    });

    if (formValues) {
      try {
        await exchangeService.sendRequest(swap.id, {
          message: formValues.message,
          offeredBookId: formValues.offeredBookId
        });
        await Swal.fire({
          icon: 'success',
          title: 'Swap Request Sent!',
          text: 'Your request has been submitted to the listing owner.',
          confirmButtonColor: '#eaa451',
        });
        fetchData();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Failed to request swap', 'error');
      }
    }
  };

  const getConditionClass = (cond) => {
    const c = (cond || '').toLowerCase().replace(' ', '-');
    return `donations-badge-condition condition-${c}`;
  };

  const filteredDonations = donations.filter((donation) => {
    const title = (donation.bookTitle || donation.customTitle || '').toLowerCase();
    const author = (donation.bookAuthor || donation.customAuthor || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || author.includes(q);
  });

  const filteredSwaps = swaps.filter((swap) => {
    const title = (swap.book?.title || '').toLowerCase();
    const author = (swap.book?.author || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || author.includes(q);
  });

  return (
    <div className="donations-page">
      <div className="donations-container">

        {/* Header */}
        <header className="donations-header">
          <div className="donations-header-title">
            <h1>The Giving Economy</h1>
            <p>Give books a second life or swap physical copies with the community.</p>
          </div>
          <div className="donations-header-actions">
            <Link href="/donations/my-donations" className="donations-btn-secondary">
              <i className="fa-solid fa-list-check" /> My Listings & Requests
            </Link>
            <Link href="/donations/donate" className="donations-btn-primary">
              <i className="fa-solid fa-hand-holding-heart" /> List a Book
            </Link>
          </div>
        </header>

        {/* Hub Tabs */}
        <div className="donations-hub-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'donations'}
            className={`donations-hub-tab ${activeTab === 'donations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('donations'); setSearchQuery(''); }}
          >
            <i className="fa-solid fa-hand-holding-heart" /> Donations
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'swaps'}
            className={`donations-hub-tab ${activeTab === 'swaps' ? 'active' : ''}`}
            onClick={() => { setActiveTab('swaps'); setSearchQuery(''); }}
          >
            <i className="fa-solid fa-arrows-rotate" /> Peer Swaps
          </button>
        </div>

        {/* Search */}
        <div className="donations-filter-bar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor="donationSearch" className="donations-label" style={{ display: 'none' }}>
              Search
            </label>
            <input
              type="text"
              id="donationSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'donations' ? 'Search donations by title or author…' : 'Search swaps by title or author…'}
              className="donations-search-input"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="donations-loading">
            <div className="donations-loading-spinner" />
            <p>Loading available {activeTab === 'donations' ? 'donations' : 'swap listings'}…</p>
          </div>
        ) : activeTab === 'donations' ? (
          /* ===== DONATIONS TAB ===== */
          filteredDonations.length > 0 ? (
            <div className="donations-grid">
              {filteredDonations.map((donation) => {
                const title = donation.bookTitle || donation.customTitle;
                const author = donation.bookAuthor || donation.customAuthor;
                const coverUrl = donation.bookCoverUrl || `https://placehold.co/120x180?text=${encodeURIComponent(title || 'Book')}`;

                return (
                  <article key={donation.id} className="donations-card">
                    <div className="donations-card-cover-wrapper">
                      <img
                        src={coverUrl}
                        alt={title}
                        className="donations-card-cover"
                      />
                      <span className={getConditionClass(donation.condition)}>
                        {donation.condition}
                      </span>
                    </div>
                    <div className="donations-card-body">
                      <h2 className="donations-card-title">{title}</h2>
                      <p className="donations-card-author">by {author}</p>
                      <p className="donations-card-desc">
                        {donation.description || 'No description provided by the donor.'}
                      </p>

                      <div className="donations-card-meta">
                        <span className="donations-donor">
                          <i className="fa-solid fa-user" /> {donation.donorName}
                        </span>
                        <span>
                          {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRequestDonation(donation)}
                        className="donations-request-btn"
                      >
                        <i className="fa-solid fa-circle-arrow-down" /> Request Book
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="donations-empty">
              <i className="fa-solid fa-book-open" />
              <h3>No donations found</h3>
              {searchQuery ? (
                <p>Try searching for a different title or author.</p>
              ) : (
                <p>Be the first to list a donation for the community!</p>
              )}
            </div>
          )
        ) : (
          /* ===== PEER SWAPS TAB ===== */
          filteredSwaps.length > 0 ? (
            <div className="donations-grid">
              {filteredSwaps.map((swap) => {
                const title = swap.book?.title || 'Unknown Book';
                const author = swap.book?.author || 'Unknown Author';
                const coverUrl = swap.book?.coverUrl || `https://placehold.co/120x180?text=${encodeURIComponent(title)}`;
                const ownerName = swap.user?.fullName || 'Unknown';

                return (
                  <article key={swap.id} className="donations-card">
                    <div className="donations-card-cover-wrapper">
                      <img
                        src={coverUrl}
                        alt={title}
                        className="donations-card-cover"
                      />
                      <span className="donations-badge-type">{swap.type}</span>
                    </div>
                    <div className="donations-card-body">
                      <h2 className="donations-card-title">{title}</h2>
                      <p className="donations-card-author">by {author}</p>
                      <p className="donations-card-desc">
                        {swap.description || 'No details provided.'}
                      </p>

                      <div className="donations-card-meta" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                        <span><i className="fa-solid fa-user" /> {ownerName}</span>
                        <span><i className="fa-solid fa-location-dot" /> {swap.location}</span>
                        <span className={getConditionClass(swap.bookCondition)}>
                          {swap.bookCondition}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRequestSwap(swap)}
                        className="donations-request-btn donations-swap-btn"
                      >
                        <i className="fa-solid fa-arrows-rotate" /> Request Swap
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="donations-empty">
              <i className="fa-solid fa-arrows-rotate" />
              <h3>No exchange listings found</h3>
              {searchQuery ? (
                <p>Try searching for a different title or author.</p>
              ) : (
                <p>Be the first to list a book for swapping!</p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function DiscoverDonations() {
  return (
    <ClientOnly>
      <DiscoverDonationsInner />
    </ClientOnly>
  );
}
