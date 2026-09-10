import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    // Because we have a file dependency in the package.json, we need to deduplicate react from that depenedency.
    dedupe: ['react'],
  },
  plugins: [react()],
});
