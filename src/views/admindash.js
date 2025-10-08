import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admindash.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const sidebarRef = useRef();

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.classList.contains("admin-sidebar-toggle")
      ) {
        setSidebarOpen(false);
      }
    }
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    // Fetch approved users count
    async function fetchApprovedUsers() {
      try {
        const res = await fetch("http://localhost:5000/api/kyc/requests?status=approved");
        const data = await res.json();
        setUserCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        setUserCount(0);
      }
    }
    fetchApprovedUsers();
  }, []);

  const handleLogout = () => {
    // localStorage.removeItem('token');
    navigate("/login"); // changed from "/" to "/login"
  };

  // Navigation button click handler (replace with your logic)
  const handleNav = (page) => {
    setSidebarOpen(false);
    // Example navigation logic:
    if (page === "dashboard") {
      // Already on dashboard, do nothing or reload
    } else if (page === "users") {
      navigate("/admin/users"); // <-- ensure this line is present
    } else if (page === "connections") {
      navigate("/admin/connections"); // <-- enable navigation to connections page
    } else if (page === "reports") {
      // navigate("/admin/reports");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Topbar */}
      <div className="admin-topbar">
        <button
          className="admin-sidebar-toggle"
          aria-label="Open menu"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          &#9776;
        </button>
        <span className="admin-logo">GasCo Admin</span>
        <span className="admin-user">Admin</span>
      </div>

      {/* Sidebar Slide-out */}
      <aside
        className={`admin-sidebar${sidebarOpen ? " open" : ""}`}
        ref={sidebarRef}
      >
        <div className="sidebar-logo">
          <span role="img" aria-label="logo">🛠️</span> GasCo Admin
        </div>
        <nav>
          <ul>
            <li className="active">
              <button className="sidebar-btn" onClick={() => handleNav("dashboard")}>
                <span className="sidebar-icon" role="img" aria-label="dashboard">📊</span>
                Dashboard
              </button>
            </li>
            <li>
              <button className="sidebar-btn" onClick={() => handleNav("users")}>
                <span className="sidebar-icon" role="img" aria-label="users">👥</span>
                Users
              </button>
            </li>
            <li>
              <button className="sidebar-btn" onClick={() => handleNav("connections")}>
                <span className="sidebar-icon" role="img" aria-label="connections">🔗</span>
                Connections
              </button>
            </li>
            <li>
              <button className="sidebar-btn" onClick={() => handleNav("reports")}>
                <span className="sidebar-icon" role="img" aria-label="reports">📑</span>
                Reports
              </button>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className={`admin-main-content${sidebarOpen ? " sidebar-open" : ""}`}>
        <header className="main-header">
          <h1>Admin Dashboard</h1>
        </header>

        <section className="stats">
          <h2>Overview</h2>
          <div className="stats-cards">
            <div className="card">
              <div className="card-title">Number of users</div>
              <div className="card-value">{userCount}</div>
            </div>
            <div className="card">
              <div className="card-title">Pending tasks</div>
              <div className="card-value"></div>
            </div>
            <div className="card">
              <div className="card-title">Recent Alerts</div>
              <div className="card-value"></div>
            </div>
          </div>
        </section>

        <section className="actions">
          <h2>Actions</h2>
          <div className="action-buttons">
            <button className="action-btn">View All Users</button>
            <button className="action-btn">Manage Data</button>
            <button className="action-btn">Generate Reports</button>
          </div>
        </section>

        <div className="admin-content">
          <p>Welcome Administrator</p>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
