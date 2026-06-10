import Link from 'next/link';

export default function NotFound() {
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
        <h1 style={{ fontSize: '6rem', fontWeight: 700, color: '#eaa451', margin: 0, lineHeight: 1 }}>404</h1>
        <h2 style={{ color: '#1a1a2e', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: '#888', marginBottom: '2rem' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, #eaa451, #e58c23)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 12,
          textDecoration: 'none',
          fontWeight: 600
        }}>
          <i className="fa-solid fa-house" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
