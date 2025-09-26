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
          target: 'https://prod-registration.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app1/, ''),
        },
        '/app2': {
          target: 'https://prod-choicepage.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app2/, ''),
        },
        '/repcreationprofile/*': {
          target: 'https://prod-rep-profile-creation.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/repcreationprofile/, ''),
        },
        '/repassessments/*': {
          target: 'https://prod-rep-assessments.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/repassessments/, ''),
        },
        '/repdashboard/*': {
          target: 'https://prod-rep-dashboard.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/repdashboard/, ''),
        },
        '/reporchestrator/*': {
          target: 'https://prod-rep-orchestrator.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/reporchestrator/, ''),
        },
        '/copilot': {
          target: 'https://prod-copilot.harx.ai/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/copilot/, ''),
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'], // Pre-bundle react and react-dom to ensure smooth behavior
    },
  };
});
