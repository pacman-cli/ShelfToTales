/**
 * Next 15 file-based robots.txt. Disallows crawlers from indexing the
 * authenticated areas of the app, allows everything else.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shelftotales.example';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/my-profile',
          '/shop-cart',
          '/shop-checkout',
          '/wishlist',
          '/purchase-history',
          '/order-detail/',
          '/virtual-bookshelf',
          '/read-book/',
          '/blog-management',
          '/reader-network',
          '/reading-dashboard',
          '/reading-room',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
