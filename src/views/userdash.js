import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/userdash.css";

const GasMonitorDashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gasData, setGasData] = useState(null);
  const [error, setError] = useState("");
  const [approved, setApproved] = useState(null);

  const dropdownRef = useRef();
  const sidebarRef = useRef();
  const navigate = useNavigate();

  // ✅ Check for admin approval
  useEffect(() => {
    async function checkApproval() {
      try {
        const res = await fetch("http://localhost:5000/api/payments/check", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setApproved(data.approved); // expects { approved: true/false }
          if (!data.approved) {
            // Optionally redirect or show waiting message
            navigate("/waitingapproval");
          }
        }
      } catch {
        setApproved(false);
        navigate("/waitingapproval");
      }
    }
    checkApproval();
  }, [navigate]);

  // ✅ Fetch gas data for logged-in user
  useEffect(() => {
    async function fetchGasStatus() {
      try {
        const res = await fetch("http://localhost:5000/api/gas/status", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          setGasData(data);
          setError(""); // clear error if data is fetched
        } else {
          const errData = await res.json();
          setGasData(null);
          setError(errData.message || "Unable to fetch gas data.");
        }
      } catch (err) {
        setGasData(null);
        setError("Network error or server unavailable.");
      }
    }

    fetchGasStatus();
    const interval = setInterval(fetchGasStatus, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Refill gas after successful payment
  useEffect(() => {
    const paymentDone = localStorage.getItem('gasRefilled');
    if (paymentDone) {
      setGasData(prev => prev ? { ...prev, gasLevel: 100, alertMessage: '' } : prev);
      localStorage.removeItem('gasRefilled');
    }
  }, [gasData]);

  // ✅ Handle dropdown + sidebar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.classList.contains("hamburger")
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => setDropdownOpen((open) => !open);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  // Play alarm sound and show notification when gas leakage is detected
  useEffect(() => {
    if (gasData && gasData.leakageDetected) {
      // Play alarm sound
      const alarm = new Audio('/alarm.mp3'); // Correct path for public folder
      alarm.play().catch(e => console.error("Error playing sound:", e));

      // Show system notification
      if (Notification.permission === "granted") {
        new Notification("Gas Leakage Alert!", {
          body: gasData.alertMessage || "Immediate action required: Gas leakage detected!",
          icon: '/alert-icon.png', // Optional: place an alert icon in your public folder
          vibrate: [200, 100, 200]
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Gas Leakage Alert!", {
              body: gasData.alertMessage || "Immediate action required: Gas leakage detected!",
              icon: '/alert-icon.png',
              vibrate: [200, 100, 200]
            });
          }
        });
      }
    }
  }, [gasData]);

  if (approved === false) {
    return null; // or show a loading spinner
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Drawer */}
      {sidebarOpen && (
        <aside
          className="sidebar-drawer open"
          ref={sidebarRef}
          style={{ left: 0, right: "auto" }}
        >
          <div className="sidebar-header">
            <span className="sidebar-title">Menu</span>
            <button
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
              title="Close"
              style={{
                left: "auto",
                right: 0,
                position: "absolute",
              }}
            >
              &times;
            </button>
          </div>
          <nav className="sidebar-nav">
            <ul>
              <li>
                <a href="/userdash" onClick={() => setSidebarOpen(false)}>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/history" onClick={() => setSidebarOpen(false)}>
                  History
                </a>
              </li>
              <li>
                <a href="/payment" onClick={() => setSidebarOpen(false)}>
                  Payment
                </a>
              </li>
              <li>
                <a href="/feedback" onClick={() => setSidebarOpen(false)}>
                  Feedback
                </a>
              </li>
              <li>
                <button
                  className="sidebar-logout-btn"
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: "#d32f2f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginTop: "1em",
                    fontWeight: 500,
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          style={{ left: 0, right: "auto" }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <button
          className="hamburger"
          aria-label="Open menu"
          onClick={handleSidebarToggle}
        >
          <span />
          <span />
          <span />
        </button>
        <h1>Gas Monitor</h1>

        {/* Profile Dropdown */}
        <div
          className="profile-dropdown"
          ref={dropdownRef}
          style={{ position: "relative" }}
        >
          <button
            className="profile-btn"
            title="Profile"
            onClick={handleProfileClick}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                borderRadius: "50%",
                background: "#e0e0e0",
                display: "block",
              }}
            >
              <circle cx="24" cy="24" r="24" fill="#e0e0e0" />
              <circle cx="24" cy="20" r="8" fill="#bdbdbd" />
              <ellipse cx="24" cy="34" rx="12" ry="7" fill="#bdbdbd" />
            </svg>
          </button>
          {dropdownOpen && (
            <div
              className="profile-dropdown-list"
              style={{
                position: "absolute",
                right: 0,
                top: "110%",
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                minWidth: "150px",
                zIndex: 10,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/editprofile");
                }}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <h2>Dashboard</h2>
        {error ? (
          <p style={{ color: "red", fontWeight: 500 }}>{error}</p>
        ) : gasData ? (
          <>
            {/* Always show backend alert message if present, support multiple lines */}
            {gasData.alertMessage && (
              <div className="alert-box">
                {gasData.alertMessage.split('\n').map((msg, idx) => (
                  <div key={idx}>{msg}</div>
                ))}
                {/* Show buttons if gas level is 20 or below */}
                {gasData.gasLevel <= 20 && (
                  <div style={{ marginTop: '1em', display: 'flex', gap: '1em' }}>
                    <button
                      style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.7em 1.5em', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => {
                        localStorage.setItem('gasRefilled', 'true');
                        navigate('/payment');
                      }}
                    >
                      Payment
                    </button>
                    <button
                      style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.7em 1.5em', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => setGasData({ ...gasData, alertMessage: '' })}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="stats-container">
              <div
                className="stat-box"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/gasmonitoring")}
              >
                <h3>Current Gas Level</h3>
                <p>{gasData.gasLevel}%</p>
              </div>
              <div className="stat-box">
                <h3>Gas Leakage</h3>
                <p>{gasData.leakageDetected ? "🚨 Detected" : "✅ Safe"}</p>
              </div>
              <div
                className="stat-box alert-box"
                style={{
                  background: gasData.leakageDetected ? "#fff3e0" : "#e3f2fd",
                  color: gasData.leakageDetected ? "#d32f2f" : "#1976d2",
                  border: "2px solid",
                  borderColor: gasData.leakageDetected ? "#d32f2f" : "#1976d2",
                  borderRadius: "10px",
                  padding: "1em",
                  fontWeight: 600,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ marginBottom: "0.5em" }}>Alert Notification</h3>
                <div style={{ fontSize: "1.1em" }}>
                  {gasData.alertMessage
                    ? gasData.alertMessage.split('\n').map((msg, idx) => (
                        <div key={idx}>{msg}</div>
                      ))
                    : "No alerts"}
                </div>
              </div>
              <div className="stat-box">
                <h3>Estimate Date</h3>
                <p>
                  {gasData.estimateDate
                    ? gasData.estimateDate
                    : "2024-12-01"}
                </p>
              </div>
              <div className="stat-box">
                <h3>Tube Expiry Date</h3>
                <p>
                  {gasData.tubeExpiryDate
                    ? gasData.tubeExpiryDate
                    : "2025-06-01"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p>Loading gas data...</p>
        )}
      </main>
    </div>
  );
};

export default GasMonitorDashboard;