import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import CSSRouteLoader from './components/CSSRouteLoader';
import VisitorTracker from './VisitorTracker';
import './App.css';
import Cookies from 'js-cookie';
import React from 'react';

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
        {/* Host chrome only; MF UIs mount into #container-* in index.html */}
        <Route path="*" element={null} />
      </Routes>
    </Router>
  );
};

export default App;
