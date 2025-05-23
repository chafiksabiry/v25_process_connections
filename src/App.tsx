//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import Cookies from 'js-cookie';

// Authentication check component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = () => {
    const userId = Cookies.get('userId');
    const token = localStorage.getItem('token');
    return userId && token;
  };

  if (!isAuthenticated()) {
    // Redirect to app1 if not authenticated
    return <Navigate to="/app1" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/app1" element={<div id="container-app1"></div>} />
        <Route path="/auth" element={<Navigate to="/app1" />} />
        <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
        <Route path="/auth/linkedin/signin/callback" element={<LinkedInSignInCallback />} />

        {/* Protected routes */}
        <Route path="/app2" element={
          <ProtectedRoute>
            <div id="container-app2"></div>
          </ProtectedRoute>
        } />
        <Route path="/repcreationprofile/*" element={
          <ProtectedRoute>
            <div id="container-repcreationprofile"></div>
          </ProtectedRoute>
        } />
        <Route path="/repassessments/*" element={
          <ProtectedRoute>
            <div id="container-repassessments"></div>
          </ProtectedRoute>
        } />
        <Route path="/app4" element={
          <ProtectedRoute>
            <div id="container-app4"></div>
          </ProtectedRoute>
        } />
        <Route path="/app5" element={
          <ProtectedRoute>
            <div id="container-app5"></div>
          </ProtectedRoute>
        } />
        <Route path="/app6" element={
          <ProtectedRoute>
            <div id="container-app6"></div>
          </ProtectedRoute>
        } />
        <Route path="/app7" element={
          <ProtectedRoute>
            <div id="container-app7"></div>
          </ProtectedRoute>
        } />
        <Route path="/repdashboard/*" element={
          <ProtectedRoute>
            <div id="container-app8"></div>
          </ProtectedRoute>
        } />
        <Route path="/reporchestrator/*" element={
          <ProtectedRoute>
            <div id="container-reporchestrator"></div>
          </ProtectedRoute>
        } />
        <Route path="/app11" element={
          <ProtectedRoute>
            <div id="container-app11"></div>
          </ProtectedRoute>
        } />
        <Route path="/knowledgebase/*" element={
          <ProtectedRoute>
            <div id="container-app9"></div>
          </ProtectedRoute>
        } />
        <Route path="/gigs" element={
          <ProtectedRoute>
            <div id="container-gigs"></div>
          </ProtectedRoute>
        } />
        <Route path="/company" element={
          <ProtectedRoute>
            <div id="container-company"></div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
