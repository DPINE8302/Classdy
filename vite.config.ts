import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['recharts'],
          dates: ['date-fns'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
  },
});
