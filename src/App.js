import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/login';
import Register from './views/Register';
import Home from './views/home';
import GasMonitorDashboard from './views/userdash';
import AdminDashboard from './views/Admindash'; // 👈 Import the admin dashboard

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/userdash" element={<GasMonitorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* 👈 Add this line */}
      </Routes>
    </Router>
  );
}

export default App;
