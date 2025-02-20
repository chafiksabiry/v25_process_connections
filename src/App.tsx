//import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      
      <Routes>
        <Route path="/app2" element={ <div id="container-app2"></div>}/>
        <Route path="/app1" element={ <div id="container-app1"></div>}/>
        <Route path="/app3" element={ <div id="container-app3"></div>}/>
        <Route path="/app5" element={ <div id="container-app4"></div>}/>
        <Route path="/app5" element={ <div id="container-app5"></div>}/>
        <Route path="/app6" element={ <div id="container-app6"></div>}/>
      </Routes>
    </Router>
  );
};

export default App;
