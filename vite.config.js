import { defineConfig } from 'vite';

// Relative base so the build works from any path (Netlify root, sub-folder, file preview).
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 4096,
    sourcemap: false,
  },
});
