import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/login';
import Register from './views/Register';
import Home from './views/home';
import GasMonitorDashboard from './views/userdash';
import AdminDashboard from './views/Admindash';
import KYCForm from './views/Newconnection'; // ✅ Import correctly
import Payment from './views/payment';
import EditProfile from './views/editprofile'; 
import ConnectionRequests from './views/connection';
import AdminUserList from './views/adminuser';
import GasMonitoring from './views/gasmonitoring';
import ProfileUpdated from './views/profileupdated';
import WaitingApproval from './views/waitingapproval'; // Import the new component
import ProtectedRoute from './component/protection';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Protect user dashboard route */}
        <Route path="/userdash" element={
          <ProtectedRoute>
            <GasMonitorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/kyc" element={<KYCForm />} /> {/* ✅ Route added */}
        <Route path="/payment" element={<Payment />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/admin/connections" element={<ConnectionRequests />} />
        <Route path="/admin/users" element={<AdminUserList />} />
        <Route path="/gasmonitoring" element={<GasMonitoring />} /> {/* <-- add this route */}
        <Route path="/profileupdated" element={<ProfileUpdated />} />
        <Route path="/waitingapproval" element={<WaitingApproval />} /> {/* New route for waiting approval page */}
        
      </Routes>
    </Router>
  );
}

export default App;
