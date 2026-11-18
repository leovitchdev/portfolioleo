import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: process.env.GITHUB_PAGES === 'true' ? '/portfolioleo/' : '/',
  build: {
    outDir: '../dist',
    assetsDir: 'site-assets',
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 0,
  },
  server: {
    strictPort: true,
  },
});
