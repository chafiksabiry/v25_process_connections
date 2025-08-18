//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import CSSRouteLoader from './components/CSSRouteLoader';
import './App.css';
//import Cookies from 'js-cookie';

// Authentication check component
/* const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
}; */

const App = () => {
  return (
    <Router>
      <CSSRouteLoader />
      <Routes>
        {/* Public routes */}
        <Route path="/app1" element={<div id="container-app1"></div>} />
        <Route path="/auth" element={<Navigate to="/app1" />} />
        <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
        <Route path="/auth/linkedin/signin/callback" element={<LinkedInSignInCallback />} />
        <Route path="/app2" element={<div id="container-app2"></div>} />
        <Route path="/repcreationprofile/*" element={<div id="container-repcreationprofile"></div>} />
        <Route path="/repassessments/*" element={<div id="container-repassessments"></div>} />
        <Route path="/repdashboard/*" element={<div id="container-app8"></div>} />
        <Route path="/reporchestrator/*" element={<div id="container-reporchestrator"></div>} />
        <Route path="/copilot" element={ <div id="container-copilot"></div>}/>
      </Routes>
    </Router>
  );
};

export default App;
