import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isQiankun = process.env.QIANKUN === 'true'; // Define the Qiankun environment

export default defineConfig({
  plugins: [
    react({
    }),
  ],
  optimizeDeps: {
    exclude: ['src/main.jsx'], // Exclude problematic file
  },
  server: {
    port: 3000,
    cors: {
      origin: '*', // Allow all origins for local development
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    hmr: {
      protocol: 'http',
      host: 'localhost',
    },
  },
  base: isQiankun ? '/main-app/' : './', // Adjust the base path for Qiankun deployment
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'system', // Necessary for Qiankun integration
      },
      external: isQiankun ? ['react', 'react-dom'] : [], // Exclude React and ReactDOM in Qiankun mode
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Support for both .jsx and .tsx
  },
});
