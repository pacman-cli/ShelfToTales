'use client';

import React, { useState } from 'react';
import { reviewService } from '@/lib/api';

const COLORS = {
  bg: '#18181b',
  card: '#27272a',
  border: '#3f3f46',
  text: '#fafafa',
  muted: '#a1a1aa',
  accent: '#10b981',
  accentHover: '#059669',
  amber: '#f59e0b',
  amberBg: 'rgba(245,158,11,0.12)',
  red: '#ef4444',
  redBg: 'rgba(239,68,68,0.12)',
  star: '#eab308',
  starEmpty: '#52525b',
};

const S = {
  card: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: '24px 28px',
    maxWidth: 520,
    width: '100%',
    fontFamily: 'inherit',
  },
  label: {
    display: 'block',
    color: COLORS.muted,
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  textarea: {
    width: '100%',
    minHeight: 120,
    padding: '12px 14px',
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.bg,
    color: COLORS.text,
    fontSize: '0.95rem',
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  starRow: {
    display: 'flex',
    gap: 4,
    marginBottom: 4,
  },
  star: {
    cursor: 'pointer',
    fontSize: '1.6rem',
    transition: 'transform 0.15s, color 0.15s',
    background: 'none',
    border: 'none',
    padding: 0,
    lineHeight: 1,
  },
  counter: {
    fontSize: '0.75rem',
    color: COLORS.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  counterError: {
    color: COLORS.red,
  },
  submitBtn: {
    width: '100%',
    padding: '12px 0',
    borderRadius: 10,
    border: 'none',
    background: COLORS.accent,
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s, opacity 0.2s',
    marginTop: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed',
  },
  toast: {
    position: 'fixed',
    top: 24,
    right: 24,
    zIndex: 9999,
    padding: '14px 20px',
    borderRadius: 12,
    maxWidth: 400,
    fontSize: '0.9rem',
    fontWeight: 600,
    boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
    animation: 'slideInRight 0.3s ease',
  },
  error: {
    background: COLORS.redBg,
    color: COLORS.red,
    border: `1px solid rgba(239,68,68,0.3)`,
  },
  spoiler: {
    background: COLORS.amberBg,
    color: COLORS.amber,
    border: `1px solid rgba(245,158,11,0.3)`,
  },
  success: {
    background: 'rgba(16,185,129,0.12)',
    color: COLORS.accent,
    border: `1px solid rgba(16,185,129,0.3)`,
  },
};

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

function StarIcon({ filled, hovered }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={filled || hovered ? COLORS.star : 'none'} stroke={filled || hovered ? COLORS.star : COLORS.starEmpty} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function SubmitReviewForm({ bookId, userId, onReviewSubmitted }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const charCount = text.trim().length;
  const isValid = charCount >= 20 && rating >= 1 && !submitting;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const resetForm = () => {
    setText('');
    setRating(0);
    setHoveredStar(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setToast(null);

    try {
      const response = await reviewService.submitModerated({
        bookId,
        userId,
        reviewText: text.trim(),
        rating,
      });

      const data = response.data;
      const isSpoiler = data?.isSpoiler ?? false;

      if (isSpoiler) {
        showToast('spoiler', 'Your review was flagged as a spoiler and will be blurred for other readers.');
      } else {
        showToast('success', 'Review posted successfully!');
      }

      resetForm();
      onReviewSubmitted?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit review. Please try again.';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {toast && (
        <div style={{ ...S.toast, ...(S[toast.type] || S.error) }}>
          {toast.type === 'spoiler' && '⚠ '}
          {toast.type === 'success' && '✓ '}
          {toast.type === 'error' && '✕ '}
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={S.card}>
        <label style={S.label}>Your Review</label>
        <textarea
          style={{
            ...S.textarea,
            borderColor: text.length > 0 && charCount < 20 ? COLORS.red : COLORS.border,
          }}
          placeholder="Share your thoughts about this book…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitting}
          autoFocus
        />
        <div style={{ ...S.counter, ...(charCount > 0 && charCount < 20 ? S.counterError : {}) }}>
          {charCount}/20 minimum
        </div>

        <label style={{ ...S.label, marginTop: 16 }}>Rating</label>
        <div style={S.starRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              style={{
                ...S.star,
                transform: (hoveredStar === i || rating === i) ? 'scale(1.15)' : 'scale(1)',
              }}
              onMouseEnter={() => !submitting && setHoveredStar(i)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => !submitting && setRating(i)}
              disabled={submitting}
              aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
            >
              <StarIcon filled={i <= rating} hovered={i <= hoveredStar && i > rating} />
            </button>
          ))}
        </div>

        <button
          type="submit"
          style={{
            ...S.submitBtn,
            ...(submitting || !isValid ? S.submitBtnDisabled : {}),
            background: submitting || !isValid ? COLORS.border : COLORS.accent,
          }}
          disabled={!isValid}
        >
          {submitting && <Spinner />}
          {submitting ? 'Submitting…' : 'Post Review'}
        </button>
      </form>
    </>
  );
}
