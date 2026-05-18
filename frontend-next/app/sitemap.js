/**
 * Next 15 file-based sitemap. Generates /sitemap.xml at build time
 * listing every public, non-protected route in the app. Dynamic
 * routes are excluded (you'd typically populate them from your
 * database — example commented out below).
 *
 * Override the base URL via NEXT_PUBLIC_SITE_URL.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shelftotales.example';

// Public, statically-known routes. Auth-gated routes (dashboard, cart,
// my-profile, etc.) are deliberately excluded.
const STATIC_ROUTES = [
  '',
  '/about-us',
  '/services',
  '/faq',
  '/help-desk',
  '/pricing',
  '/privacy-policy',
  '/contact-us',
  '/books-grid-view',
  '/books-grid-view-sidebar',
  '/books-list-view-sidebar',
  '/book-list',
  '/shop-list',
  '/shop-login',
  '/shop-registration',
  '/blog-grid',
  '/blog-large-sidebar',
  '/blog-list-sidebar',
  '/blog-detail',
  '/index-2',
  '/under-construction',
  '/coming-soon',
];

export default function sitemap() {
  const now = new Date();
  return STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : 0.7,
  }));

  // To include dynamic routes (e.g. shop-detail/:id), do something like:
  //
  //   const books = await bookService.getAll({ size: 1000 });
  //   const bookEntries = books.data.content.map((b) => ({
  //     url: `${BASE_URL}/shop-detail/${b.id}`,
  //     lastModified: new Date(b.updatedAt),
  //     changeFrequency: 'weekly',
  //     priority: 0.6,
  //   }));
  //   return [...staticEntries, ...bookEntries];
}
