import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// FiveM loads ui_page from the resource's own local files, so every asset
// reference must be relative ("./assets/..") rather than root-absolute
// ("/assets/.."). `base: './'` is what makes that work.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    // Keep the CEF bundle lean; ServerHub has no reason to ship a large app.
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
  },
});
