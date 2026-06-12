'use client';

import dynamic from 'next/dynamic';

const FlipbookViewer = dynamic(
  () => import('@/components/features/Flipbook/FlipbookViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="text-center py-5" role="status" aria-live="polite">
        <div className="spinner-border text-primary" aria-hidden="true" />
        <p className="text-muted mt-2">Loading flipbook…</p>
      </div>
    ),
  },
);

/**
 * @param {object} props
 * @param {{id: string}} props.params
 * @returns {JSX.Element}
 */
export default function FlipbookPage({ params }) {
  return (
    <main className="container py-4">
      <FlipbookViewer flipbookId={params.id} />
    </main>
  );
}
