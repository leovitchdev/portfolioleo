import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/portfolioleo/' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 0,
  },
  server: {
    strictPort: true,
  },
});
