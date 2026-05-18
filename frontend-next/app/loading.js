/**
 * Root loading UI. Next.js renders this automatically while
 * server components for a route segment are loading. Client-only pages
 * (the ones wrapped in <ClientOnly />) won't trigger this — they have
 * their own mount-time fallback.
 */
export default function RootLoading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
