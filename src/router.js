// router.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './views/home';
import Register from './views/Register';
import Login from './views/login';

import GasMonitorDashboard from './views/userdash';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
  <Route path="/userdash" element={<GasMonitorDashboard />} />
    </Routes>
  );
}

export default AppRoutes;
