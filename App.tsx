import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import CSSRouteLoader from './components/CSSRouteLoader';
import VisitorTracker from './VisitorTracker';
import './App.css';
import Cookies from 'js-cookie';
import React, { useEffect } from 'react';

const MF_CONTAINERS = [
  'container-auth',
  'container-reps',
  'container-company',
  'container-home',
] as const;

/** Toggle which static qiankun container is visible for the current path. */
function MicroAppContainerVisibility() {
  const { pathname } = useLocation();

  useEffect(() => {
    const active = new Set<string>();
    if (
      pathname === '/' ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/admin')
    ) {
      active.add('container-auth');
    }
    if (pathname.startsWith('/reps')) active.add('container-reps');
    if (pathname.startsWith('/company')) active.add('container-company');
    if (pathname === '/home') active.add('container-home');

    for (const id of MF_CONTAINERS) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.toggle('harx-mf-active', active.has(id));
    }
  }, [pathname]);

  return null;
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
      <CSSRouteLoader />
      <MicroAppContainerVisibility />
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
