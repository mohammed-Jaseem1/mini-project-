import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Link,
  Description,
  Payment,
  Logout,
  Forum as FeedbackIcon,
  DirectionsCar as AutoBookingIcon,
  TrendingUp,
  Notifications,
  Assignment
} from '@mui/icons-material';
import axios from "axios";
import '../styles/admindash.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [systemStatus, setSystemStatus] = useState({
    api: "loading",
    db: "loading",
    payment: "loading"
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingConnections, setPendingConnections] = useState(0);
  const [pendingFeedback, setPendingFeedback] = useState(0);
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

    // Fetch monthly report for revenue and alerts
    async function fetchMonthlyStats() {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const res = await axios.get("http://localhost:5000/api/report/monthly-report", {
          params: { month, year },
          withCredentials: true
        });
        const report = res.data;
        setMonthlyRevenue(report.totalIncome || 0);
        setRecentAlerts(report.alertCount || 0);
      } catch (err) {
        setMonthlyRevenue(0);
        setRecentAlerts(0);
      }
    }
    fetchMonthlyStats();

    // Fetch pending connection requests
    async function fetchPendingConnections() {
      try {
        const res = await fetch("http://localhost:5000/api/kyc/requests?status=pending");
        const data = await res.json();
        setPendingConnections(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        setPendingConnections(0);
      }
    }
    fetchPendingConnections();

    // Fetch pending feedback
    async function fetchPendingFeedback() {
      try {
        const res = await fetch("http://localhost:5000/api/feedback?status=pending");
        const data = await res.json();
        setPendingFeedback(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        setPendingFeedback(0);
      }
    }
    fetchPendingFeedback();

    // Fetch system status
    async function fetchSystemStatus() {
      try {
        // API status
        const apiRes = await fetch("http://localhost:5000/");
        const apiStatus = apiRes.ok ? "online" : "offline";

        // DB status (simulate by hitting a protected endpoint)
        let dbStatus = "offline";
        try {
          const dbRes = await fetch("http://localhost:5000/api/kyc/requests");
          dbStatus = dbRes.ok ? "online" : "offline";
        } catch {
          dbStatus = "offline";
        }

        // Payment gateway status (simulate: always maintenance)
        const paymentStatus = "maintenance";

        setSystemStatus({
          api: apiStatus,
          db: dbStatus,
          payment: paymentStatus
        });
      } catch {
        setSystemStatus({
          api: "offline",
          db: "offline",
          payment: "offline"
        });
      }
    }
    fetchSystemStatus();

    // Fetch recent activities: payments and new connections
    async function fetchRecentActivities() {
      try {
        // Fetch recent payments
        const paymentsRes = await axios.get("http://localhost:5000/api/payment", { withCredentials: true });
        const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data.slice(0, 5) : [];

        // Fetch recent connection requests (approved)
        const connectionsRes = await fetch("http://localhost:5000/api/kyc/requests?status=approved");
        const connectionsData = await connectionsRes.json();
        const connections = Array.isArray(connectionsData)
          ? connectionsData
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
          : [];

        // Merge and sort by date
        const activities = [
          ...payments.map(p => ({
            id: p._id,
            action: `Payment of ₹${p.amountPaid} by ${p.gmail}`,
            time: new Date(p.date).toLocaleString(),
            type: "payment"
          })),
          ...connections.map(c => ({
            id: c._id,
            action: `New connection for ${c.email}`,
            time: new Date(c.createdAt).toLocaleString(),
            type: "connection"
          }))
        ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 8); // Show latest 8 activities

        setRecentActivities(activities);
      } catch {
        setRecentActivities([]);
      }
    }
    fetchRecentActivities();
  }, []);

  const handleLogout = () => {
    navigate("/login");
  };

  const handleNav = (page) => {
    setSidebarOpen(false);
    const routes = {
      dashboard: "/admin/dashboard",
      users: "/admin/users",
      connections: "/admin/connections",
      "payment-history": "/admin/payment-history",
      "auto-bookings": "/admin/auto-booking",
      "monthly-report": "/admin/monthly-report"
    };
    
    if (routes[page]) {
      navigate(routes[page]);
    }
  };

  // Mock data for dashboard stats
  const stats = [
    {
      title: "Total Users",
      value: userCount,
      change: "",
      icon: <People className="stat-icon" />,
      color: "primary"
    },
    {
      title: "Pending Connections",
      value: pendingConnections,
      change: "",
      icon: <Assignment className="stat-icon" />,
      color: "warning"
    },
    {
      title: "Pending Feedback",
      value: pendingFeedback,
      change: "",
      icon: <FeedbackIcon className="stat-icon" />,
      color: "warning"
    },
    {
      title: "Recent Alerts",
      value: recentAlerts,
      change: "",
      icon: <Notifications className="stat-icon" />,
      color: "error"
    },
    {
      title: "Monthly Revenue",
      value: `₹${monthlyRevenue}`,
      change: "",
      icon: <TrendingUp className="stat-icon" />,
      color: "success"
    }
  ];

  const getActivityIcon = (type) => {
    const icons = {
      user: <People className="activity-icon" />,
      payment: <Payment className="activity-icon" />,
      verification: <Description className="activity-icon" />,
      connection: <Link className="activity-icon" />
    };
    return icons[type] || <Assignment className="activity-icon" />;
  };

  return (
    <Box className="admin-dashboard">
      <AppBar position="fixed" className="admin-appbar">
        <Toolbar className="appbar-toolbar">
          <IconButton
            color="inherit"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className="app-title">
            GasCo Admin
          </Typography>
          <Box className="header-actions">
            <Chip 
              label="Admin" 
              variant="filled" 
              color="secondary" 
              size="small" 
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="sidebar-drawer"
        ref={sidebarRef}
      >
        <Toolbar />
        <Box className="sidebar-content">
          <List className="sidebar-list">
            <ListItem button onClick={() => handleNav("dashboard")} className="nav-item">
              <ListItemIcon><Dashboard className="nav-icon" /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => handleNav("users")} className="nav-item">
              <ListItemIcon><People className="nav-icon" /></ListItemIcon>
              <ListItemText primary="Users" />
            </ListItem>
            <ListItem button onClick={() => handleNav("connections")} className="nav-item">
              <ListItemIcon><Link className="nav-icon" /></ListItemIcon>
              <ListItemText primary="Connections" />
            </ListItem>
            <ListItem button onClick={() => handleNav("payment-history")} className="nav-item">
              <ListItemIcon><Payment className="nav-icon" /></ListItemIcon>
              <ListItemText primary="Payment History" />
            </ListItem>
            <ListItem button onClick={() => handleNav("auto-bookings")} className="nav-item">
              <ListItemIcon><AutoBookingIcon className="nav-icon" /></ListItemIcon>
              <ListItemText primary="Auto Bookings" />
            </ListItem>
            <ListItem button onClick={() => handleNav("monthly-report")} className="nav-item">
              <ListItemIcon><Description className="nav-icon" /></ListItemIcon>
              <ListItemText primary="Monthly Report" />
            </ListItem>
            <ListItem button onClick={() => navigate("/admin/feedback")} className="nav-item">
              <ListItemIcon><FeedbackIcon className="nav-icon" /></ListItemIcon>
              <ListItemText primary="Feedback" />
            </ListItem>
          </List>
          <Box className="sidebar-footer">
            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Drawer>

      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Toolbar className="content-toolbar" />
        <Box className="dashboard-container">
          <Box className="dashboard-header">
            <Typography variant="h4" className="page-title">
              Dashboard Overview
            </Typography>
            <Typography variant="body1" className="page-subtitle">
              Welcome back! Here's what's happening with your platform today.
            </Typography>
          </Box>
          
          <Grid container spacing={2} className="stats-grid">
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className={`stat-card stat-card-${stat.color}`}>
                  <CardContent className="stat-content">
                    <Box className="stat-header">
                      <Typography variant="subtitle2" className="stat-title">
                        {stat.title}
                      </Typography>
                      {stat.icon}
                    </Box>
                    <Typography variant="h3" className="stat-value">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" className="stat-change">
                      {stat.change}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} className="content-grid">
            <Grid item xs={12} lg={8}>
              <Paper className="quick-actions-paper">
                <Typography variant="h6" className="section-title">
                  Quick Actions
                </Typography>
                <Box className="actions-grid">
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/admin/users')}
                    className="action-btn primary"
                    startIcon={<People />}
                  >
                    Manage Users
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin/monthly-report')}
                    className="action-btn secondary"
                    startIcon={<Description />}
                  >
                    Generate Report
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin/connections')}
                    className="action-btn tertiary"
                    startIcon={<Link />}
                  >
                    View Connections
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin/auto-booking')}
                    className="action-btn quaternary"
                    startIcon={<AutoBookingIcon />}
                  >
                    Auto Bookings
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Paper className="status-paper">
                <Typography variant="h6" className="section-title">
                  System Status
                </Typography>
                <Box className="status-list">
                  <Box className={`status-item ${systemStatus.api === "online" ? "online" : "offline"}`}>
                    <Box className="status-indicator"></Box>
                    <Typography variant="body2" className="status-text">API Server</Typography>
                    <Chip label={systemStatus.api === "online" ? "Online" : "Offline"} size="small" color={systemStatus.api === "online" ? "success" : "error"} className="status-chip" />
                  </Box>
                  <Box className={`status-item ${systemStatus.db === "online" ? "online" : "offline"}`}>
                    <Box className="status-indicator"></Box>
                    <Typography variant="body2" className="status-text">Database</Typography>
                    <Chip label={systemStatus.db === "online" ? "Online" : "Offline"} size="small" color={systemStatus.db === "online" ? "success" : "error"} className="status-chip" />
                  </Box>
                  <Box className={`status-item ${systemStatus.payment === "maintenance" ? "maintenance" : "online"}`}>
                    <Box className="status-indicator"></Box>
                    <Typography variant="body2" className="status-text">Payment Gateway</Typography>
                    <Chip label={systemStatus.payment === "maintenance" ? "Maintenance" : "Online"} size="small" color={systemStatus.payment === "maintenance" ? "warning" : "success"} className="status-chip" />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Paper className="recent-activity-paper">
            <Typography variant="h6" className="section-title">
              Recent Activity
            </Typography>
            <Box className="activity-list">
              {recentActivities.length === 0 ? (
                <Typography variant="body2" sx={{ color: "#888", p: 2 }}>
                  No recent activity found.
                </Typography>
              ) : (
                recentActivities.map((activity) => (
                  <Box key={activity.id} className="activity-item">
                    <Box className="activity-icon-wrapper">
                      {getActivityIcon(activity.type)}
                    </Box>
                    <Box className="activity-content">
                      <Typography variant="body2" className="activity-action">
                        {activity.action}
                      </Typography>
                      <Typography variant="caption" className="activity-time">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Box>
      </main>
    </Box>
  );
}

export default AdminDashboard;