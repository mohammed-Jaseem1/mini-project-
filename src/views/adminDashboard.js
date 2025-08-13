import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth info here if using tokens/localStorage (optional)
    // localStorage.removeItem('token'); // example if using token

    navigate("/"); // Redirect to login page on logout
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <main className="admin-main">
        <section className="stats">
          <h2>Overview</h2>
          <p>Number of users: 25</p> {/* You can replace with dynamic data later */}
          <p>Pending tasks: 3</p>    {/* You can replace with dynamic data later */}
        </section>

        <section className="actions">
          <h2>Actions</h2>
          <button className="action-btn">View All Users</button>
          <button className="action-btn">Manage Data</button>
          <button className="action-btn">Generate Reports</button>
        </section>

        <div className="admin-content">
          <div>Welcome Administrator</div>
          {/* Add your admin dashboard content here */}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
