//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback';
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import CSSRouteLoader from './components/CSSRouteLoader';
import './App.css';
import Cookies from 'js-cookie';

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
        {/* Public routes */}
        <Route path="/app1" element={<div id="container-app1"></div>} />
        <Route path="/auth" element={<Navigate to="/app1" />} />
        <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
        <Route path="/auth/linkedin/signin/callback" element={<LinkedInSignInCallback />} />
        <Route path="/app2" element={<div id="container-app2"></div>} />
        {/*         <Route path="/profile-wizard" element={ <Navigate to="/app3"/>}/>
        <Route path="/app3" element={ <div id="container-app3"></div>}/> */}
        <Route path="/repcreationprofile/*" element={<div id="container-repcreationprofile"></div>} />
        <Route path="/repassessments/*" element={<div id="container-repassessments"></div>} />
        <Route path="/app4" element={<div id="container-app4"></div>} />
        <Route path="/app5" element={<div id="container-app5"></div>} />
        <Route path="/app6" element={<div id="container-app6"></div>} />
        <Route path="/app7" element={<div id="container-app7"></div>} />
        <Route path="/repdashboard/*" element={<div id="container-app8"></div>} />
        <Route path="/reporchestrator/*" element={<div id="container-reporchestrator"></div>} />
        <Route path="/app11" element={<div id="container-app11"></div>} />
        <Route path="/knowledgebase/*" element={<div id="container-app9"></div>} />
        <Route path="/gigs" element={<div id="container-gigs"></div>} />
        <Route path="/company" element={<div id="container-company"></div>} />
        <Route path="/app12" element={ <div id="container-app12"></div>}/>
        <Route path="/copilot" element={ <div id="container-copilot"></div>}/>
        <Route path="/training" element={<div id="container-training"></div>} />
        <Route path="/training/companydashboard/*" element={<div id="container-training"></div>} />
        <Route path="/training/repdashboard/*" element={<div id="container-training"></div>} />
      </Routes>
    </Router>
  );
};

export default App;
