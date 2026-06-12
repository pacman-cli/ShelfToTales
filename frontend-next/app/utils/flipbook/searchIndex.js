/**
 * Lightweight in-memory text search over page payloads.
 *
 * We avoid pulling in flexsearch at runtime: the mock flipbook only carries a
 * few hundred words, and a hand-rolled scan gives us ranking, snippet
 * extraction, and highlighting without the dependency weight. The shape of the
 * result mirrors what a FlexSearch adapter would emit, so swapping later is a
 * one-file change.
 *
 * @typedef {object} SearchHit
 * @property {number} pageIndex Zero-based index of the matching page.
 * @property {string} pageTitle Display title of the page.
 * @property {number} score Higher = better match.
 * @property {string} snippet Context around the first match with markers.
 */

/**
 * Tokenize a string for case-insensitive matching.
 *
 * @param {string} input Raw text.
 * @returns {string[]} Lower-cased word tokens.
 */
function tokenize(input) {
  return String(input || '')
    .toLowerCase()
    .split(/[^a-z0-9']+/i)
    .filter(Boolean);
}

/**
 * Build a highlighted snippet showing the matched term in context.
 *
 * @param {string} text Source text.
 * @param {string} term Search term to highlight.
 * @param {number} radius Characters on each side of the match.
 * @returns {string} Snippet with <mark> wrappers.
 */
function buildSnippet(text, term, radius = 40) {
  if (!text) return '';
  const lower = text.toLowerCase();
  const idx = lower.indexOf(term);
  if (idx === -1) {
    return text.slice(0, radius * 2) + (text.length > radius * 2 ? '…' : '');
  }
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + term.length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  const matched = text.slice(idx, idx + term.length);
  return `${prefix}${text.slice(start, idx)}<mark>${matched}</mark>${text.slice(idx + term.length, end)}${suffix}`;
}

/**
 * Search a flipbook's pages for the given query.
 *
 * @param {object} flipbook Flipbook payload with `pages` array.
 * @param {string} rawQuery Free-text query.
 * @param {number} [limit=20] Maximum hits to return.
 * @returns {SearchHit[]} Ranked hits with snippets.
 */
export function searchFlipbook(flipbook, rawQuery, limit = 20) {
  if (!flipbook || !Array.isArray(flipbook.pages)) return [];
  const query = String(rawQuery || '').trim().toLowerCase();
  if (!query) return [];

  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const hits = [];
  flipbook.pages.forEach((page) => {
    const haystack = `${page.title || ''} ${page.text || ''}`.toLowerCase();
    if (!haystack) return;
    let score = 0;
    tokens.forEach((token) => {
      if (!token) return;
      const occurrences = haystack.split(token).length - 1;
      score += occurrences;
    });
    if (score === 0) return;
    hits.push({
      pageIndex: page.index ?? 0,
      pageTitle: page.title || `Page ${(page.index ?? 0) + 1}`,
      score,
      snippet: buildSnippet(page.text || page.title || '', tokens[0]),
    });
  });

  return hits
    .sort((a, b) => b.score - a.score || a.pageIndex - b.pageIndex)
    .slice(0, limit);
}
