//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LinkedInCallback from './components/LinkedInCallback'; // Import the LinkedIn callback component
import LinkedInSignInCallback from './components/LinkedInSignInCallback';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const App = () => {
  useEffect(() => {
    const handleMessage = (event: any) => {
      console.log('📨 Received message:', event.data);

      if (event.data.type === 'LOGOUT') {
        console.log('🔑 Processing logout message');
        // Clear storage and redirect
        localStorage.clear();
        Object.keys(Cookies.get()).forEach(cookie => Cookies.remove(cookie));

        console.log('🚀 Redirecting to auth page');
        // Clear the history stack and redirect to auth
        window.history.pushState(null, '', '/auth');
        window.history.go(-(window.history.length - 1));
        setTimeout(() => {
          window.location.replace('/auth');
        }, 100);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <Router>

      <Routes>
        <Route path="/app1" element={<div id="container-app1"></div>} />
        <Route path="/auth" element={<Navigate to="/app1" />} />
        <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} /> {/* 👈 Add this line */}
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
        <Route path="/knowledgebase" element={<div id="container-app9"></div>} />
        <Route path="/gigs" element={<div id="container-gigs"></div>} />
        <Route path="/company" element={<div id="container-company"></div>} />
      </Routes>
    </Router>
  );
};

export default App;
