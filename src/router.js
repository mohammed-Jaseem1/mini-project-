import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/login';
import Register from './views/Register';
import Home from './views/home';
import GasMonitorDashboard from './views/userdash';
import AdminDashboard from './views/AdminDashboard';
import KYCForm from './views/KYCForm'; // ✅ Import correctly

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/userdash" element={<GasMonitorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/kyc" element={<KYCForm />} /> {/* ✅ Route added */}
      </Routes>
    </Router>
  );
}

export default App;
