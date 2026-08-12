import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/',
  define: { 'import.meta.env.VITE_DATA_MODE': JSON.stringify(process.env.VITE_DATA_MODE ?? '') },
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts' },
});
