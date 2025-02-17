import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerMicroApps, start } from 'qiankun';
import './index.css';

// Register microfrontends
registerMicroApps([
  {
    name: 'micro-frontend-name',
    entry: '//localhost:3001',
    container: '#micro-frontend-container',
    activeRule: '/micro-frontend',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
]);

// Configure and start Qiankun
const startQiankun = async () => {
  try {
    start({
      prefetch: 'all', // Change to 'all' for eager loading
      sandbox: {
        strictStyleIsolation: true,
      },
      singular: false, // Allow multiple micro apps
      // timeoutMs: 10000, // Increase timeout to 10 seconds
    });
    console.log('[Host] Qiankun started successfully');
  } catch (error) {
    console.error('[Host] Failed to start Qiankun:', error);
  }
};

// Mount host app first
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('[Host] Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

// Start Qiankun after host app is mounted
startQiankun();