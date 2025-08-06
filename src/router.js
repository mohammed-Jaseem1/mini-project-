// router.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './views/home';
import Register from './views/Register';
import Login from './views/login';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default AppRoutes;
