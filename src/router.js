import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './views/home';
import Register from './views/Register';
import Login from './views/login'; // Fixed case to match actual filename
import AdminDashboard from './views/adminDashboard';
import NewConnection from './views/Newconnection';
import UserDashboard from './views/userDashboard';


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/new-connection" element={<NewConnection />} />
       <Route path="/user-Dashboard" element={<UserDashboard />} />
      
      
     
    </Routes>
  );
}

export default AppRoutes;
