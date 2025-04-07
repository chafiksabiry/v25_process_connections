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
        <Route path="/gigsmanual" element={ <div id="container-app5"></div>}/>
        <Route path="/gigsai" element={ <div id="container-app6"></div>}/>
        <Route path="/dashboardcompany" element={ <div id="container-app7"></div>}/>
        <Route path="/repdashboard" element={ <div id="container-app8"></div>}/>
        <Route path="/knowledgebase" element={ <div id="container-app9"></div>}/>
        <Route path="/gigs" element={ <div id="container-gigs"></div>}/>
        <Route path="/company" element={ <div id="container-company"></div>}/>
      </Routes>
    </Router>
  );
};

export default App;
