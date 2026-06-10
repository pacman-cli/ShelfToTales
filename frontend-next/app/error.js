'use client';

export default function GlobalError({ error, reset }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#faf8f5',
      fontFamily: 'Playfair Display, serif'
    }}>
      <div className="text-center" style={{ maxWidth: 500, padding: '2rem' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: '#eaa451', marginBottom: '1rem' }} />
        <h2 style={{ color: '#1a1a2e', marginBottom: '1rem' }}>Something went wrong</h2>
        <p style={{ color: '#888', marginBottom: '2rem' }}>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          style={{
            background: 'linear-gradient(135deg, #eaa451, #e58c23)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 12,
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          <i className="fa-solid fa-rotate-right me-2" /> Try Again
        </button>
      </div>
    </div>
  );
}
