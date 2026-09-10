import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        index: './index.html',
        'service-worker': './service-worker.ts',
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'service-worker'
            ? 'service-worker.js'
            : 'assets/[name]-[hash].js';
        },
      },
    },
  },
  resolve: {
    // Because we have a file dependency in the package.json, we need to deduplicate react from that depenedency.
    dedupe: ['react'],
  },
  plugins: [react()],
});
