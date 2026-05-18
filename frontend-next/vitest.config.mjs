import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [
    react({
      // Treat .js files as JSX (matches the existing CRA convention).
      include: '**/*.{js,jsx,ts,tsx}',
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    css: false,
    include: ['app/**/*.{test,spec}.{js,jsx}'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  esbuild: {
    // Backstop: also tell esbuild to parse .js as JSX.
    loader: 'jsx',
    include: /\.[jt]sx?$/,
    exclude: [],
  },
});
