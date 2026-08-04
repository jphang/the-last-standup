/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { logReceiverPlugin } from './src/lib/logger/viteLogReceiver';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), logReceiverPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {
    environment: 'node',
  },
});
