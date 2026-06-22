import { describe, expect, it, vi } from 'vitest';

vi.mock('pdfjs-dist/build/pdf.worker.min.mjs', () => 'mocked-worker-url');

describe('PdfViewer', () => {
  it('placeholder so vitest does not error before Commit B', () => {
    expect(1).toBe(1);
  });
});
