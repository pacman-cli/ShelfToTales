import Script from 'next/script';

export const metadata = {
  title: 'Sign Up — Shelf To Tales',
  description: 'Create your Shelf To Tales account and start your reading journey.',
};

export default function Layout({ children }) {
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
