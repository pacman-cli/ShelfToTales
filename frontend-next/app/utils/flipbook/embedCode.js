/**
 * Build a responsive iframe embed snippet for a flipbook.
 *
 * @param {object} options Embed configuration.
 * @param {string} options.flipbookId Target flipbook identifier.
 * @param {string} [options.origin] Public origin (defaults to current location in browser).
 * @param {number} [options.width] Initial iframe width in CSS pixels.
 * @param {number} [options.height] Initial iframe height in CSS pixels.
 * @param {boolean} [options.allowFullscreen] Forward fullscreen permission.
 * @param {string} [options.startPage] Open directly to a specific 1-based page.
 * @returns {string} HTML string ready to drop into another page.
 */
export function buildEmbedCode({
  flipbookId,
  origin,
  width = 800,
  height = 600,
  allowFullscreen = true,
  startPage = '',
} = {}) {
  if (!flipbookId) {
    throw new Error('buildEmbedCode: flipbookId is required');
  }
  const safeOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const srcParams = new URLSearchParams({ embedded: '1' });
  if (startPage) {
    srcParams.set('page', String(startPage));
  }
  const src = `${safeOrigin}/flipbook/${encodeURIComponent(flipbookId)}?${srcParams.toString()}`;
  const allowAttr = allowFullscreen ? ' allowfullscreen' : '';
  return `<iframe src="${src}" width="${width}" height="${height}" frameborder="0"${allowAttr} title="Flipbook preview" loading="lazy"></iframe>`;
}

/**
 * Copy text to the clipboard with a graceful fallback for older browsers.
 *
 * @param {string} text Text to copy.
 * @returns {Promise<boolean>} Resolves true when the copy succeeded.
 */
export async function copyToClipboard(text) {
  if (typeof window === 'undefined' || !text) {
    return false;
  }
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // fall through to legacy path
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (err) {
    return false;
  }
}
