//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import CSSRouteLoader from './components/CSSRouteLoader';
import VisitorTracker from './VisitorTracker';
import './App.css';
import Cookies from 'js-cookie';
import React from 'react';

/**
 * Keep qiankun containers mounted for the whole session.
 * Route-switched containers get a new DOM node on each visit / host re-render,
 * which triggers: "Target container … not existed after … mounted".
 */
const MicroAppContainers = () => {
  const { pathname } = useLocation();
  const showAuth =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/admin');
  const showReps = pathname.startsWith('/reps');
  const showCompany = pathname.startsWith('/company');

  const pane = (visible: boolean): React.CSSProperties => ({
    display: visible ? 'block' : 'none',
    minHeight: visible ? '100vh' : undefined,
  });

  return (
    <>
      <div id="container-auth" style={pane(showAuth)} />
      <div id="container-reps" style={pane(showReps)} />
      <div id="container-company" style={pane(showCompany)} />
    </>
  );
};

const App = () => {
  const userId = Cookies.get('userId');
  const token = localStorage.getItem('token');
  console.log('[V25 Main App] userId from cookie:', userId);
  console.log('[V25 Main App] token from localStorage:', token ? 'Present' : 'Not found');
  return (
    <Router>
      <VisitorTracker />
      <CSSRouteLoader />
      <Routes>
        <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />
        <Route path="/linkedin/callback" element={<LinkedInCallback />} />
        <Route path="/linkedin/signin/callback" element={<LinkedInSignInCallback />} />
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
        {/* Catch-all keeps Router happy; real UI lives in permanent MF containers */}
        <Route path="*" element={null} />
      </Routes>
      <MicroAppContainers />
    </Router>
  );
};

export default App;
