//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
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
    <div className="host-app">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/app1" element={<div id="container-app1" className="micro-frontend-container"></div>} />
          <Route path="/auth" element={<Navigate to="/app1" />} />
          <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
          <Route path="/auth/linkedin/signin/callback" element={<LinkedInSignInCallback />} />
          <Route path="/app2" element={<div id="container-app2" className="micro-frontend-container"></div>} />
          {/*         <Route path="/profile-wizard" element={ <Navigate to="/app3"/>}/>
          <Route path="/app3" element={ <div id="container-app3"></div>}/> */}
          <Route path="/repcreationprofile/*" element={<div id="container-repcreationprofile" className="micro-frontend-container"></div>} />
          <Route path="/repassessments/*" element={<div id="container-repassessments" className="micro-frontend-container"></div>} />
          <Route path="/app4" element={<div id="container-app4" className="micro-frontend-container"></div>} />
          <Route path="/app5" element={<div id="container-app5" className="micro-frontend-container"></div>} />
          <Route path="/app6" element={<div id="container-app6" className="micro-frontend-container"></div>} />
          <Route path="/app7" element={<div id="container-app7" className="micro-frontend-container"></div>} />
          <Route path="/repdashboard/*" element={<div id="container-app8" className="micro-frontend-container"></div>} />
          <Route path="/reporchestrator/*" element={<div id="container-reporchestrator" className="micro-frontend-container"></div>} />
          <Route path="/app11" element={<div id="container-app11" className="micro-frontend-container"></div>} />
          <Route path="/knowledgebase/*" element={<div id="container-app9" className="micro-frontend-container"></div>} />
          <Route path="/gigs" element={<div id="container-gigs" className="micro-frontend-container"></div>} />
          <Route path="/company" element={<div id="container-company" className="micro-frontend-container"></div>} />
          <Route path="/app12" element={ <div id="container-app12" className="micro-frontend-container"></div>}/>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
