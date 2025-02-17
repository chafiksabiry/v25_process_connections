import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <h1>Host App with Qiankun</h1>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/micro-frontend" element={<div>Microfrontend Triggered</div>} />
      </Routes>
      <div id="micro-frontend-container"></div>
    </Router>
  );
};

export default App;
