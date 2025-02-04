import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isQiankun = process.env.QIANKUN === 'true';


export default defineConfig({
  plugins: [
    react({
    }),
  ],
  optimizeDeps: {
    exclude: ['src/main.jsx'], // Exclude problematic file
  },
  server: {
    host: '0.0.0.0', // Allow access from Docker
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
        entryFileNames : '[name].js',
      },
      external: isQiankun ? ['react', 'react-dom','systemjs'] : [], // Exclude React and ReactDOM in Qiankun mode
      treeshake: false,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Support for both .jsx and .tsx
  },
});
