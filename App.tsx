//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import CSSRouteLoader from './components/CSSRouteLoader';
import VisitorTracker from './VisitorTracker';
import './App.css';
import Cookies from 'js-cookie';
import React from 'react';

const RegistrationShell = () => <div id="container-auth"></div>;

const App = () => {
  // Log userId in console
  const userId = Cookies.get('userId');
  const token = localStorage.getItem('token');
  console.log('[V25 Main App] userId from cookie:', userId);
  console.log('[V25 Main App] token from localStorage:', token ? 'Present' : 'Not found');
  return (
    <Router>
      <VisitorTracker />
      <CSSRouteLoader />
      <Routes>
        {/* Registration (auth) — landing + auth (signin, register, recovery…) */}
        <Route path="/" element={<RegistrationShell />} />
        <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />
        <Route path="/auth/*" element={<RegistrationShell />} />
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
