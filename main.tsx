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
    //entry: 'http://localhost:5157/',
    container: '#container-app1',
    activeRule: '/app1',
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
    //entry: 'http://localhost:5173/',
    container: '#container-app2',
    activeRule: '/app2',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
/*   {
    name: 'app3',
    entry: 'https://repcreationwizard.harx.ai/',
    //entry: 'http://localhost:5177/',
    container: '#container-app3',
    activeRule: '/app3',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  }, */
  {
    name: 'repcreationprofile',
    entry: 'https://rep-profile-creation.harx.ai/',
    container: '#container-repcreationprofile',
    activeRule: '/repcreationprofile',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  {
    name: 'repassessments',
    entry: 'https://rep-assessments.harx.ai/',
    container: '#container-repassessments',
    activeRule: '/repassessments',
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
    activeRule: '/app4',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  {
    name: 'app5',
    entry: 'https://gigsmanual.harx.ai/',
    container: '#container-app5',
    activeRule: '/app5',
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
    activeRule: '/app6',
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
    activeRule: '/app7',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
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
    name: 'repdashboard',
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
    name: 'reporchestrator',
    entry: 'https://rep-orchestrator.harx.ai/',
    container: '#container-reporchestrator',
    activeRule: '/reporchestrator',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  {
    name: 'knowledgebase',
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
    name: 'app11',
    entry: 'https://comp-orchestrator.harx.ai/',
    container: '#container-app11',
    activeRule: '/app11',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  {
    name: 'app12',
    entry: 'https://matching.harx.ai/',
    container: '#container-app12',
    activeRule: '/app12',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  {
    name: 'copilot',
    entry: 'https:/copilot.harx.ai/',
    container: '#container-copilot',
    activeRule: '/copilot',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  {
    name: 'training',
    entry: 'https://training.harx.ai/',
    container: '#container-training',
    activeRule: '/training',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  }
]);

const startQiankun = async () => {
  try {
    start({
      prefetch: true,
      sandbox: {
        strictStyleIsolation: false,
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