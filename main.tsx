import ReactDOM from 'react-dom/client';
import App from './App';
import { registerMicroApps, start, initGlobalState } from 'qiankun';
import { stripSocialMeta } from './lib/microAppTemplate';
import {
  setBootstrapMaxTime,
  setMountMaxTime,
  setUnmountMaxTime,
} from 'single-spa';
import './index.css';
import 'systemjs';
import Cookies from 'js-cookie';
import React from 'react';
import { syncPageHead } from './lib/tracking/visitorTracking';
import { MF_ENTRIES } from './lib/microfrontendEntries';
import { initConsent } from './lib/consent';
import { initConversionTracking } from './lib/tracking/conversions';
import { isLegalPath } from './lib/legalRoutes';
import { getLangFromPath } from './lib/langRoutes';
import { subscribeAuthChanged } from './lib/authSync';
import { legacyCallCenterRedirect } from './lib/callCenterRedirect';
import { isLangTelephonyPath, langTelephonyRedirect, rememberLangFromPath, rememberSiteLang } from './lib/langTelephonyRedirect';
import { installRedirectHopRule } from './lib/redirectHop';
import { isLangNomadPath, isNomadAuthPath, isNomadPortalPath, nomadLegacyRedirect } from './lib/nomadRoutes';

// Arbitrage 12 : /call-center est retiré. Si Netlify n'a pas déjà renvoyé la 301 (aperçu local, navigation interne),
// on remplace l'adresse avant tout montage de micro-application.
{
  const legacyTarget = legacyCallCenterRedirect(window.location);
  if (legacyTarget) window.history.replaceState(window.history.state, '', legacyTarget);
}

// Adresses NOMAD (24/11/2026) : anciennes adresses du parcours NOMAD (/telephony/nomad, /auth/signin?product=nomad,
// /auth/register-nomad, /telephony/start?profil=solo…, /:lang/nomad*) remplacées par /nomad* avant tout montage. Voir lib/nomadRoutes.ts.
{
  const nomadTarget = nomadLegacyRedirect(window.location);
  if (nomadTarget) {
    if (nomadTarget.lang) rememberSiteLang(nomadTarget.lang);
    window.history.replaceState(window.history.state, '', nomadTarget.url);
  }
}

// /:lang/telephony* (ex. /en/telephony) : l'application Téléphonie n'a pas de préfixe de langue. On mémorise la langue
// choisie (lue par l'application au chargement) et on remplace l'adresse par /telephony* avant tout montage,
// au lieu de laisser le module d'inscription afficher sa page 404.
{
  const langTarget = langTelephonyRedirect(window.location);
  if (langTarget) {
    rememberSiteLang(langTarget.lang);
    window.history.replaceState(window.history.state, '', langTarget.url);
  }
}

// Relais /telephony/start → inscription : la flèche « retour » du navigateur saute le relais (au lieu de renvoyer en boucle sur
// l'inscription) et ramène à la page de l'offre (ex. /nomad). Voir lib/redirectHop.ts.
const skippingRedirectHop = installRedirectHopRule(window);

// /fr, /en, /es, /ar (et les pages sous ce préfixe) : langue mémorisée comme choix explicite avant tout montage, pour que les liens sans
// préfixe (/telephony, /nomad, /auth/signin…) gardent la langue de la page, même si le module d'accueil n'est pas encore monté.
rememberLangFromPath(window.location.pathname);

// Netlify-hosted sub-apps can be slow on cold start. Raise the single-spa
// lifecycle timeouts so we stop seeing "single-spa minified message #31"
// warnings (default 4000 ms is too short for cross-domain micro-frontends).
// Second arg `false` => log a warning instead of throwing on timeout.
setBootstrapMaxTime(20000, false);
setMountMaxTime(20000, false);
setUnmountMaxTime(20000, false);

// Sync cookies ↔ localStorage for cross-domain micro-frontend access
const syncAuthStorage = () => {
  const cookieUserId = Cookies.get('userId');
  const cookieCompanyId = Cookies.get('companyId');
  const storedUserId = localStorage.getItem('userId');
  const storedCompanyId = localStorage.getItem('companyId');

  if (cookieUserId) {
    localStorage.setItem('userId', cookieUserId);
  } else if (storedUserId) {
    Cookies.set('userId', storedUserId, { path: '/', sameSite: 'Lax' });
  }

  if (cookieCompanyId) {
    localStorage.setItem('companyId', cookieCompanyId);
  } else if (storedCompanyId) {
    Cookies.set('companyId', storedCompanyId, { path: '/', sameSite: 'Lax' });
  }
};

// Sync auth data on load
syncAuthStorage();

// Watch for cookie / storage changes and keep both in sync
setInterval(syncAuthStorage, 1000);

const initialState = { userId: null as string | null, token: null as string | null };
const actions = initGlobalState(initialState);

// Keep qiankun global state aligned when any MF logs in / out
subscribeAuthChanged((detail) => {
  actions.setGlobalState({
    userId: detail.userId,
    token: detail.token,
  });
  syncAuthStorage();
});

// Listen for changes (for debugging)
// actions.onGlobalStateChange((state: any, /*prev*/) => {
//   console.log('[Main App] Global state changed:', state);
// });


// console.log("qiankun is here");

// Register microfrontends
registerMicroApps([
  {
    name: 'home',
    entry: MF_ENTRIES.home,
    //entry: 'http://localhost:5173/',
    container: '#container-home',
    activeRule: (location: { pathname: string; }) => location.pathname === '/home',
    props: {
      sandbox: {
        experimentalStyleIsolation: false,
      },
      actions,
    },
  },
  {
    name: 'auth',
    entry: MF_ENTRIES.auth,
    //entry: 'http://localhost:5157/',
    container: '#container-auth',
    activeRule: (location: { pathname: string }) => {
      const p = location.pathname;
      return (
        p === '/' ||
        p === '/taas' ||
        p.startsWith('/taas/') ||
        p.startsWith('/auth') ||
        p.startsWith('/admin') ||
        p.startsWith('/linkedin') ||
        isLegalPath(p) ||
        // Connexion et inscription NOMAD : écrans du module d'inscription.
        isNomadAuthPath(p) ||
        // /:lang/telephony* et /:lang/nomad* appartiennent à leurs applications (redirigés ci-dessus et dans App.tsx).
        (getLangFromPath(p) !== null && !isLangTelephonyPath(p) && !isLangNomadPath(p))
      );
    },
    props: {
      sandbox: {
        experimentalStyleIsolation: false,
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
    entry: MF_ENTRIES.company,
    container: '#container-company',
    // /call-center n'est plus servi par ce module : il redirige vers /telephony (arbitrage 12).
    activeRule: (location: { pathname: string }) => location.pathname.startsWith('/company'),
    props: {
      sandbox: {
        experimentalStyleIsolation: false,
      },
      actions,
    },
  },
  {
    // Application unique des centres d'appels (l'ancienne adresse /call-center y redirige).
    name: 'callcenter',
    entry: MF_ENTRIES.callcenter,
    container: '#container-callcenter',
    // /nomad (page de l'offre NOMAD) et /nomad/<écran> (portail NOMAD) aussi, sauf /nomad/connexion et /nomad/inscription
    // (module d'inscription). Voir lib/nomadRoutes.ts.
    activeRule: (location: { pathname: string }) =>
      location.pathname === '/telephony' || location.pathname.startsWith('/telephony/') || isNomadPortalPath(location.pathname),
    props: {
      sandbox: {
        experimentalStyleIsolation: false,
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
    // + wizard + assessments, all mounted under /reps.
    name: 'reps',
    entry: MF_ENTRIES.reps,
    container: '#container-reps',
    activeRule: '/reps',
    props: {
      sandbox: {
        experimentalStyleIsolation: false,
      },
      actions,
    },
  }
]);

const startQiankun = async () => {
  try {
    start({
      // Prefetch only the landing MF — company/reps cold-start during prefetch
      // was contributing to single-spa #31 bootstrap timeouts on /.
      prefetch: ['auth'],
      sandbox: {
        strictStyleIsolation: false,
        // Shadow DOM blocks Mouseflow from recording clicks inside micro-apps.
        experimentalStyleIsolation: false,
      },
      singular: false,
      // Pas de balises og:* / twitter:* en double : celles des micro-fronts sont retirées (voir lib/microAppTemplate.ts).
      getTemplate: stripSocialMeta,
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

initConsent();
initConversionTracking();

// Mount host app first
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('[Host] Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
syncPageHead();
root.render(<App />);

// Start Qiankun after host app is mounted (sauf relais sauté : la page repart aussitôt en arrière, l'application Téléphonie
// ne doit pas renvoyer vers l'inscription).
if (!skippingRedirectHop) startQiankun();