import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as cheerio from 'cheerio';

const htmlRemoveFreshPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html: any) {
      const $ = cheerio.load(html);
      $('script').eq(0).remove();  // Remove the problematic script tag (React refresh)
      html = $.html();
      return html;
    },
  };
};

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }
      ), // React plugin
      ...(isDev ? [htmlRemoveFreshPlugin()] : []),  // Only remove in production
    ],
    server: {
      port: 3000,
      cors: false, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      proxy: {
        '/app1': {
          target: 'https://prod-registration.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app1/, ''),
        },
        '/app2': {
          target: 'https://prod-choicepage.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app2/, ''),
        },
        '/app3': {
          target: 'https://prod-repcreationwizard.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app3/, ''),
        },
        '/app4': {
          target: 'https://prod-companysearchwizard.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app4/, ''),
        },
        '/app5': {
          target: 'https://prod-gigsmanual.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app5/, ''),
        },
        '/app6': {
          target: 'https://prod-gigsai.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app6/, ''),
        },
        '/app7': {
          target: 'https://prod-dashboard.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app7/, ''),
        },
        '/repdashboard': {
          target: 'https://prod-rep-dashboard.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/repdashboard/, ''),
        },
        '/comporchestrator': {
          target: 'https://prod-comp-orchestrator.harx.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/comporchestrator/, ''),
        },
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom'], // Pre-bundle react and react-dom to ensure smooth behavior
    },
  };
});
