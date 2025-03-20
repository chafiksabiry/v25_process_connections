//import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      
      <Routes>
        <Route path="/choicepage" element={ <div id="container-app2"></div>}/>
        <Route path="/registration" element={ <div id="container-app1"></div>}/>
        <Route path="/repcreationwizard" element={ <div id="container-app3"></div>}/>
        <Route path="/companysearchwizard" element={ <div id="container-app4"></div>}/>
        <Route path="/gigsmanuel" element={ <div id="container-app5"></div>}/>
        <Route path="/gigsai" element={ <div id="container-app6"></div>}/>
        <Route path="/dashboard" element={ <div id="container-app7"></div>}/>
      </Routes>
    </Router>
  );
};

export default App;
