import ReactDOM from 'react-dom/client';
import App from './App';
import { registerMicroApps, start, initGlobalState } from 'qiankun';
import './index.css';
import 'systemjs';
const initialState = { userId: null };
const actions = initGlobalState(initialState);

// Listen for changes (for debugging)
actions.onGlobalStateChange((state, /*prev*/) => {
    console.log('[Main App] Global state changed:', state);
});


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
      actions,
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
      actions,
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
      actions,
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
    activeRule: '/gigsmanual',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
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
      actions,
    },
  },
  {
    name: 'app7',
    entry: 'https://dashboard.harx.ai/',
    container: '#container-app7',
    activeRule: '/dashboardcompany',
    props: {
      sandbox: { strictStyleIsolation: false, experimentalStyleIsolation: false },
      actions,
    },
  },
  {
    name: 'gigs',
    entry: 'https://dashboard.harx.ai/gigs',
    container: '#container-gigs',
    activeRule: '/gigs',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
    {
    name: 'company',
    entry: 'https://dashboard.harx.ai/company',
    container: '#container-company',
    activeRule: '/company',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  {
    name: 'app8',
    entry: 'https://rep-dashboard.harx.ai/',
    container: '#container-app8',
    activeRule: '/repdashboard',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  {
    name: 'app9',
    entry: 'https://knowledge-base.harx.ai/',
    container: '#container-app9',
    activeRule: '/knowledgebase',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  {
    name: 'app10',
    entry: 'https://dashboard.harx.ai/',
    container: '#container-app10',
    activeRule: '/app10',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
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