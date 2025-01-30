
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      

        <Routes>
          <Route path="/app1" element={<div>Loading App 1...</div>} />
          <Route path="/app2" element={<div>Loading App 2...</div>} />
          <Route path="/app3" element={<div>Loading App 3...</div>} />
          <Route path="/app4" element={<div>Loading App 4...</div>} />
          <Route path="/app5" element={<div>Loading App 5...</div>} />
        </Routes>
      
    </Router>
  );
};

export default App;
