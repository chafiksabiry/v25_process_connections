//import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerMicroApps, start } from 'qiankun';
import './index.css';
import 'systemjs';

console.log("qiankun is here");


// Register microfrontends
registerMicroApps([
  {
    name: 'app1',
    entry: '//38.242.208.242:5157',
    container: '#container-app1',
    activeRule: '/app1',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app2',
    entry: '//38.242.208.242:5173',
    container: '#container-app2',
    activeRule: '/app2',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app3',
    entry: '//38.242.208.242:5177',
    container: '#container-app3',
    activeRule: '/app',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app4',
    entry: '//38.242.208.242:5176',
    container: '#container-app4',
    activeRule: '/app4',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app5',
    entry: '//38.242.208.242:5178',
    container: '#container-app5',
    activeRule: '/app5',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app6',
    entry: '//38.242.208.242:5179',
    container: '#container-app6',
    activeRule: '/app6',
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
