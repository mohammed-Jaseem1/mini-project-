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
import PaymentHistory from './views/PaymentHistory';
import AdminFeedback from './views/AdminFeedback'; // Import AdminFeedback component
import FeedbackForm from './views/FeedbackForm';
import AutoBooking from './views/AutoBooking'; // Import AutoBooking component
import History from './views/History';
import Booking from './views/Booking';
import Reports from './views/Reports';  // Add this import at the top with other imports
import MonthlyReport from './views/MonthlyReport'; // Add this import

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
        <Route path="/admin/payment-history" element={<PaymentHistory />} />
        <Route path="/feedback" element={<FeedbackForm />} /> 
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="admin/auto-booking" element={<AutoBooking />} /> {/* Route for AutoBooking component */}
        <Route path="/history" element={<History />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/admin/reports" element={<Reports />} />  {/* Add Reports route */}
        <Route path="/admin/monthly-report" element={<MonthlyReport />} /> {/* Add Monthly Report route */}
        
     
       
    
        
      </Routes>
    </Router>
  );
}

export default App;
