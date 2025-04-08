//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      
      <Routes>
        <Route path="/app1" element={ <div id="container-app1"></div>}/>
        <Route path="/auth" element={ <Navigate to="/app1"/>}/>
        <Route path="/app2" element={ <div id="container-app2"></div>}/>
        <Route path="/profile-wizard" element={ <Navigate to="/profile-wizard"/>}/>
        <Route path="/app3" element={ <div id="container-app3"></div>}/>
        <Route path="/app4" element={ <div id="container-app4"></div>}/>
        <Route path="/app5" element={ <div id="container-app5"></div>}/>
        <Route path="/app6" element={ <div id="container-app6"></div>}/>
        <Route path="/app7" element={ <div id="container-app7"></div>}/>
        <Route path="/app8" element={ <div id="container-app8"></div>}/>
        <Route path="/knowledgebase" element={ <div id="container-app9"></div>}/>
        <Route path="/gigs" element={ <div id="container-gigs"></div>}/>
        <Route path="/company" element={ <div id="container-company"></div>}/>
      </Routes>
    </Router>
  );
};

export default App;
