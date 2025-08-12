import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './views/home';
import Register from './views/Register';
import Login from './views/login';
import AdminDashboard from './views/adminDashboard';
import UserDashboard from './views/userDashboard';
import NewConnection from './views/Newconnection';

// Define the main application routes

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/new-connection" element={<NewConnection />} />
    </Routes>
  );
}

export default AppRoutes;
