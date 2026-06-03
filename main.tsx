import ReactDOM from 'react-dom/client';
import App from './App';
import { registerMicroApps, start, initGlobalState } from 'qiankun';
import {
  setBootstrapMaxTime,
  setMountMaxTime,
  setUnmountMaxTime,
} from 'single-spa';
import './index.css';
import 'systemjs';
import Cookies from 'js-cookie';
import React from 'react';

// Netlify-hosted sub-apps can be slow on cold start. Raise the single-spa
// lifecycle timeouts so we stop seeing "single-spa minified message #31"
// warnings (default 4000 ms is too short for cross-domain micro-frontends).
// Second arg `false` => log a warning instead of throwing on timeout.
setBootstrapMaxTime(20000, false);
setMountMaxTime(20000, false);
setUnmountMaxTime(20000, false);

// Sync cookies to localStorage for cross-domain micro-frontend access
const syncAuthToLocalStorage = () => {
  const userId = Cookies.get('userId');
  const companyId = Cookies.get('companyId');

  if (userId) {
    localStorage.setItem('userId', userId);
    // console.log('[Host] Synced userId to localStorage:', userId);
  }
  if (companyId) {
    localStorage.setItem('companyId', companyId);
    // console.log('[Host] Synced companyId to localStorage:', companyId);
  }
};

// Sync auth data on load
syncAuthToLocalStorage();

// Watch for cookie changes and sync to localStorage
setInterval(syncAuthToLocalStorage, 1000);

const initialState = { userId: null };
const actions = initGlobalState(initialState);

// Listen for changes (for debugging)
// actions.onGlobalStateChange((state: any, /*prev*/) => {
//   console.log('[Main App] Global state changed:', state);
// });


// console.log("qiankun is here");

// Register microfrontends
registerMicroApps([
  {
    name: 'home',
    entry: 'https://websitev2026.netlify.app',
    //entry: 'http://localhost:5173/',
    container: '#container-home',
    activeRule: (location: { pathname: string; }) => location.pathname === '/home',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  {
    name: 'app1',
    entry: 'https://harx25register.netlify.app',
    //entry: 'http://localhost:5157/',
    container: '#container-app1',
    activeRule: (location: { pathname: string; }) => location.pathname === '/' || location.pathname === '/app1',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  // NOTE: repcreationprofile, repassessments and repdashboard have been merged
  // into the unified `reporchestrator` micro-app. Their old prefixes now
  // redirect to /reporchestrator/* (see App.tsx). Kept here commented for
  // reference / rollback.
  // {
  //   name: 'repcreationprofile',
  //   entry: 'https://harxv25repcreationprofile.netlify.app/',
  //   container: '#container-repcreationprofile',
  //   activeRule: '/repcreationprofile',
  //   props: { sandbox: { experimentalStyleIsolation: true }, actions },
  // },
  // {
  //   name: 'repassessments',
  //   entry: 'https://harxv25assessmentsfront.netlify.app/',
  //   container: '#container-repassessments',
  //   activeRule: '/repassessments',
  //   props: { sandbox: { experimentalStyleIsolation: true }, actions },
  // },
  {
    name: 'company',
    entry: 'https://harxv25comporchestratorfront.netlify.app/',
    container: '#container-company',
    activeRule: '/company',
    props: {
      sandbox: {
        experimentalStyleIsolation: true,
      },
      actions,
    },
  },
  // {
  //   name: 'repdashboard',
  //   entry: 'https://harxv25dashboardrepfront.netlify.app/',
  //   container: '#container-app8',
  //   activeRule: '/repdashboard',
  //   props: { sandbox: { experimentalStyleIsolation: true }, actions },
  // },
  {
    // Unified rep app: onboarding orchestrator + dashboard + profile creation
    // + wizard + assessments, all mounted under /reporchestrator.
    name: 'reporchestrator',
    entry: 'https://harxv25reporchestratorfront.netlify.app/',
    container: '#container-reporchestrator',
    activeRule: '/reporchestrator',
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
      fetch: (url: RequestInfo | URL, options: RequestInit | undefined) => {
        // console.log(`[Host] Fetching: ${url}`);
        return fetch(url, {
          ...options,
          mode: "cors",
        });
      },
    });
    // console.log('[Host] Qiankun started successfully');
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