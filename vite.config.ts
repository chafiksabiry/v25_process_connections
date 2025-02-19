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
      
      cors: true, 
    },
    optimizeDeps: {
      include: ['react', 'react-dom'], // Pre-bundle react and react-dom to ensure smooth behavior
    },
  };
});
