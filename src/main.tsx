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
    entry: 'https://v25.harx.ai/registration',
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
    entry: 'https://v25.harx.ai/choicepage',
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
    entry: 'https://v25.harx.ai/repcreationwizard',
    container: '#container-app3',
    activeRule: '/app3',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app4',
    entry: 'https://v25.harx.ai/companysearchwizard',
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
    entry: 'https://v25.harx.ai/gigsmanual',
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
    entry: 'https://v25.harx.ai/gigsai',
    container: '#container-app6',
    activeRule: '/app6',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app7',
    entry: 'https://v25.harx.ai/dashboard',
    container: '#container-app7',
    activeRule: '/app7',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
]);

const startQiankun = async () => {
  try {
    start({
      prefetch: 'all',
      sandbox: {
        strictStyleIsolation: true,
        experimentalStyleIsolation: true,
      },
      singular: false,
      fetch: (url, options) => {
        console.log([Host] Fetching: ${url});
        return fetch(url, {
          ...options,
          mode: "cors",
          headers: {
            ...options?.headers,
            "Access-Control-Allow-Origin": "https://v25.harx.ai", // Attempt to enforce CORS
          },
        });
      },
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