import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

// Single input from environment variable (for singlefile builds)
const input = process.env.INPUT;

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: input || undefined,
    },
    outDir: 'dist',
    emptyOutDir: false, // Don't empty - we build multiple apps sequentially
  },
});
