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
    entry: 'https://registration.harx.ai/',
    container: '#container-app1',
    activeRule: '/registration',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app2',
    entry: 'https://choicepage.harx.ai/',
    container: '#container-app2',
    activeRule: '/choicepage',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app3',
    entry: 'https://repcreationwizard.harx.ai/',
    container: '#container-app3',
    activeRule: '/repcreationwizard',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app4',
    entry: 'https://companysearchwizard.harx.ai/',
    container: '#container-app4',
    activeRule: '/companysearchwizard',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app5',
    entry: 'https://gigsmanual.harx.ai/',
    container: '#container-app5',
    activeRule: '/gigsmanuel',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app6',
    entry: 'https://gigsai.harx.ai/',
    container: '#container-app6',
    activeRule: '/gigsai',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
    },
  },
  {
    name: 'app7',
    entry: 'https://dashboard.harx.ai/',
    container: '#container-app7',
    activeRule: '/dashboard',
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
      prefetch: true,
      sandbox: {
        strictStyleIsolation: true,
        experimentalStyleIsolation: true,
      },
      singular: false,
      fetch: (url, options) => {
        console.log(`[Host] Fetching: ${url}`);
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