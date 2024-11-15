import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // esbuild: {
  //   jsxInject: `import React from 'react'`,
  // },
  // optimizeDeps: {
  //   force: true
  // },
  // test: {
  //   globals: true,
  //   environment: 'jsdom',
  //   setupFiles: './vitest.setup.ts',
  // },
})
