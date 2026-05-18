import Script from 'next/script';

/**
 * Loads the Google Identity Services (GSI) client SDK only on the
 * /shop-login route (and any nested routes under it). The page
 * component then calls `window.google.accounts.id.*` to render the
 * sign-in button.
 *
 * Strategy is "afterInteractive" so the script doesn't block the
 * initial page render. The GSI button is rendered inside a useEffect
 * that polls for `window.google` until ready, so race conditions are
 * benign.
 */
export default function ShopLoginLayout({ children }) {
  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        async
        defer
      />
      {children}
    </>
  );
}
