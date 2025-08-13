import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/login';
import Register from './views/Register';
import Home from './views/home';
import GasMonitorDashboard from './views/userdash';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />               {/* Home page */}
        <Route path="/register" element={<Register />} />   {/* Register page */}
        <Route path="/login" element={<Login />} />         {/* Login page */}
        <Route path="/userdash" element={<GasMonitorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
