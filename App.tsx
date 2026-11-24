import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import CSSRouteLoader from './components/CSSRouteLoader';
import CookieBanner from './components/CookieBanner';
import WhatsAppSupportButton from './components/WhatsAppSupportButton';
import { isLegalPath } from './lib/legalRoutes';
import { getLangFromPath } from './lib/langRoutes';
import VisitorTracker from './VisitorTracker';
import { legacyCallCenterRedirect } from './lib/callCenterRedirect';
import { isLangTelephonyPath, langTelephonyRedirect, rememberLangFromPath, rememberSiteLang } from './lib/langTelephonyRedirect';
import { isLangNomadPath, isNomadAuthPath, isNomadPortalPath, nomadLegacyRedirect } from './lib/nomadRoutes';
import { cloudLegacyRedirect, isCloudAuthPath, isCloudPortalPath, isLangCloudPath } from './lib/cloudRoutes';
import './App.css';
import Cookies from 'js-cookie';
import React, { useEffect } from 'react';

const MF_CONTAINERS = [
  'container-auth',
  'container-reps',
  'container-company',
  'container-callcenter',
  'container-home',
] as const;

/** Toggle which static qiankun container is visible for the current path. */
function MicroAppContainerVisibility() {
  const { pathname } = useLocation();

  useEffect(() => {
    const active = new Set<string>();
    if (
      pathname === '/' ||
      pathname === '/taas' ||
      pathname.startsWith('/taas/') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/admin') ||
      isLegalPath(pathname) ||
      isNomadAuthPath(pathname) ||
      isCloudAuthPath(pathname) ||
      (getLangFromPath(pathname) !== null && !isLangTelephonyPath(pathname) && !isLangNomadPath(pathname) && !isLangCloudPath(pathname))
    ) {
      active.add('container-auth');
    }
    if (pathname.startsWith('/reps')) active.add('container-reps');
    if (pathname.startsWith('/company')) active.add('container-company');
    if (pathname === '/telephony' || pathname.startsWith('/telephony/') || isNomadPortalPath(pathname) || isCloudPortalPath(pathname)) {
      active.add('container-callcenter');
    }
    if (pathname === '/home') active.add('container-home');

    for (const id of MF_CONTAINERS) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.toggle('harx-mf-active', active.has(id));
    }
  }, [pathname]);

  return null;
}

/** Navigation interne vers une page préfixée (drapeau de l'accueil : /fr → /en) : la langue de l'adresse devient le choix mémorisé. */
function SiteLangFromPath() {
  const { pathname } = useLocation();
  useEffect(() => {
    rememberLangFromPath(pathname);
  }, [pathname]);
  return null;
}

/** /call-center atteint par navigation interne (pushState) : même table que la 301 Netlify. */
function LegacyCallCenterRedirect() {
  const location = useLocation();
  const target = legacyCallCenterRedirect(location) ?? '/cloud';
  return <Navigate to={target} replace />;
}

/** /:lang/telephony* atteint par navigation interne (pushState) : même règle qu'au chargement (main.tsx). */
function LangTelephonyRedirect() {
  const location = useLocation();
  const target = langTelephonyRedirect(location);
  if (!target) return null;
  // Écrit avant la navigation : l'application Téléphonie lit la langue au chargement de son module (écriture idempotente).
  rememberSiteLang(target.lang);
  return <Navigate to={target.url} replace />;
}

/** Ancienne adresse du parcours NOMAD atteinte par navigation interne (pushState) : même règle qu'au chargement (main.tsx). */
function NomadLegacyRedirect() {
  const location = useLocation();
  const target = nomadLegacyRedirect(location);
  if (!target) return null;
  if (target.lang) rememberSiteLang(target.lang);
  return <Navigate to={target.url} replace />;
}

/**
 * Ancienne entrée du parcours CLOUD Receptionist atteinte par navigation interne (pushState) : même règle qu'au chargement (main.tsx),
 * après la règle NOMAD (aucune adresse NOMAD n'est touchée : nomadLegacyRedirect passe d'abord).
 */
function CloudLegacyRedirect() {
  const location = useLocation();
  if (nomadLegacyRedirect(location)) return null;
  const target = cloudLegacyRedirect(location);
  if (!target) return null;
  if (target.lang) rememberSiteLang(target.lang);
  return <Navigate to={target.url} replace />;
}

const HostPage = ({ children }: { children: React.ReactNode }) => (
  <div data-host-page style={{ minHeight: '100vh' }}>
    {children}
  </div>
);

/**
 * Qiankun containers live in index.html (outside React #root) so they are
 * never recreated/destroyed by the host Router.
 */
const App = () => {
  const userId = Cookies.get('userId');
  const token = localStorage.getItem('token');
  console.log('[V25 Main App] userId from cookie:', userId);
  console.log('[V25 Main App] token from localStorage:', token ? 'Present' : 'Not found');
  return (
    <Router>
      <VisitorTracker />
      <CookieBanner />
      <WhatsAppSupportButton />
      <CSSRouteLoader />
      <MicroAppContainerVisibility />
      <SiteLangFromPath />
      <NomadLegacyRedirect />
      <CloudLegacyRedirect />
      <Routes>
        <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />
        <Route
          path="/linkedin/callback"
          element={
            <HostPage>
              <LinkedInCallback />
            </HostPage>
          }
        />
        <Route
          path="/linkedin/signin/callback"
          element={
            <HostPage>
              <LinkedInSignInCallback />
            </HostPage>
          }
        />
        <Route path="/call-center/*" element={<LegacyCallCenterRedirect />} />
        <Route path="/:lang/telephony/*" element={<LangTelephonyRedirect />} />
        <Route
          path="/reporchestrator/*"
          element={
            <Navigate
              to={
                window.location.pathname.replace(/^\/reporchestrator/, '/reps') +
                window.location.search
              }
              replace
            />
          }
        />
        <Route path="*" element={null} />
      </Routes>
    </Router>
  );
};

export default App;
