
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      

        <Routes>
          <Route path="/app1"/>
          <Route path="/app2"/>
          <Route path="/app3"/>
          <Route path="/app4"/>
          <Route path="/app5"/>
        </Routes>
      
    </Router>
  );
};

export default App;
