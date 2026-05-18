/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external sources used by the existing app (Unsplash,
  // Pravatar avatars, ui-avatars, via.placeholder). Add others as needed.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },

  // Many pages still use plain <img> (ported from CRA). Disable the lint
  // rule until pages are migrated to next/image individually.
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app'],
  },
};

export default nextConfig;
