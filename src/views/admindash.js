import React from 'react';
import './admindash.css';

const GasMonitorDashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Gas Monitor</h1>
        <nav>
          <ul>
            <li><a href="/userdash">Dashboard</a></li>
            <li><a href="/history">History</a></li>
            <li><a href="/payment">Payment</a></li>
            <li><a href="/feedback">Feedback</a></li>
          </ul>
        </nav>
        <div className="profile-picture">
          <img src="profile-picture.jpg" alt="Profile" />
        </div>
      </header>
      <main className="dashboard-main">
        <h2>Dashboard</h2>
        <div className="stats-container">
          <div className="stat-box">
            <h3>Current Gas Level</h3>
            <p>75%</p>
          </div>
          <div className="stat-box">
            <h3>Estimated Refill Date</h3>
            <p>2024-08-15</p>
          </div>
          <div className="stat-box">
            <h3>Tube Expiry Date</h3>
            <p>2025-01-01</p>
          </div>
        </div>
        <div className="alerts-container">
          <h3>Alerts</h3>
          <div className="alert-box warning">
            <i className="warning-icon"></i>
            <p>Low Gas Level</p>
            <p>Gas level is below 20%</p>
          </div>
        </div>
        <div className="notifications-container">
          <h3>Notifications</h3>
          <div className="notification-box success">
            <i className="success-icon"></i>
            <p>Cylinder booked successfully</p>
            <p>2024-07-20 10:00 AM</p>
          </div>
          <div className="notification-box success">
            <i className="success-icon"></i>
            <p>Payment received</p>
            <p>2024-07-15 02:30 PM</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GasMonitorDashboard;