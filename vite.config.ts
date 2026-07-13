import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Bind IPv4 loopback so browser tooling (which uses 127.0.0.1) can reach it.
    host: '127.0.0.1',
    // Honor the PORT assigned by the launcher; fall back to 3000 for plain `npm run dev`.
    port: Number(process.env.PORT) || 3000,
    open: false,
  },
});
