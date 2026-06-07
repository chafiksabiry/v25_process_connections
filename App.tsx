//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import CSSRouteLoader from './components/CSSRouteLoader';
import './App.css';
import Cookies from 'js-cookie';
import React from 'react';

const App = () => {
  // Log userId in console
  const userId = Cookies.get('userId');
  const token = localStorage.getItem('token');
  console.log('[V25 Main App] userId from cookie:', userId);
  console.log('[V25 Main App] token from localStorage:', token ? 'Present' : 'Not found');
  return (
    <Router>
      <CSSRouteLoader />
      <Routes>
        {/* Registration (app1) — landing + auth */}
        <Route path="/" element={<div id="container-app1"></div>} />
        <Route path="/app1" element={<div id="container-app1"></div>} />
        <Route path="/auth" element={<Navigate to="/" />} />
        <Route path="/linkedin/callback" element={<LinkedInCallback />} />
        <Route path="/linkedin/signin/callback" element={<LinkedInSignInCallback />} />

        {/* Reps unified app (onboarding orchestrator + dashboard).
            Mounted under /reps. Old /reporchestrator/* links redirect here. */}
        <Route path="/reps/*" element={<div id="container-reps"></div>} />
        <Route
          path="/reporchestrator/*"
          element={<Navigate to={window.location.pathname.replace(/^\/reporchestrator/, '/reps') + window.location.search} replace />}
        />

        {/* Comporchestrator (company app) */}
        <Route path="/company/*" element={<div id="container-company"></div>} />
      </Routes>
    </Router>
  );
};

export default App;
