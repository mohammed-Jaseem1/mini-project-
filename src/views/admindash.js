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
  alpha
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
  DirectionsCar as AutoBookingIcon // Add this import
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: '#ffffff',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: theme.shape.borderRadius * 2,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
  },
}));

const StatNumber = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: theme.palette.grey[800],
  marginBottom: theme.spacing(1),
  fontFamily: '"Inter", sans-serif',
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(4),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    backgroundColor: '#f8fafc',
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

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
    if (page === "dashboard") {
      // Already on dashboard, do nothing or reload
    } else if (page === "users") {
      navigate("/admin/users");
    } else if (page === "connections") {
      navigate("/admin/connections");
    } else if (page === "reports") {
      navigate("/admin/reports");  // Add proper navigation
    } else if (page === "payment-history") {
      navigate("/admin/payment-history");
    } else if (page === "auto-bookings") {
      navigate("/admin/auto-booking");
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#ffffff',
        color: '#1e293b',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
            GasCo Admin
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#ffffff',
            borderRight: '1px solid rgba(0,0,0,0.05)',
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => handleNav("dashboard")}>
            <ListItemIcon><Dashboard /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => handleNav("users")}>
            <ListItemIcon><People /></ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
          <ListItem button onClick={() => handleNav("connections")}>
            <ListItemIcon><Link /></ListItemIcon>
            <ListItemText primary="Connections" />
          </ListItem>
          <ListItem button onClick={() => handleNav("reports")}>
            <ListItemIcon><Description /></ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItem>
          <ListItem button onClick={() => handleNav("payment-history")}>
            <ListItemIcon><Payment /></ListItemIcon>
            <ListItemText primary="Payment History" />
          </ListItem>
          <ListItem button onClick={() => handleNav("auto-bookings")}>
            <ListItemIcon><AutoBookingIcon /></ListItemIcon>
            <ListItemText primary="Auto Bookings" />
          </ListItem>
          <ListItem button onClick={() => navigate("/admin/feedback")}>
            <ListItemIcon><FeedbackIcon /></ListItemIcon>
            <ListItemText primary="Feedback" />
          </ListItem>
        </List>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Main open={sidebarOpen}>
        <Toolbar />
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4,
            fontWeight: 700,
            color: '#1e293b',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          Dashboard Overview
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    Total Users
                  </Typography>
                  <StatNumber>{userCount}</StatNumber>
                </Box>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  +12% from last month
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    Pending Tasks
                  </Typography>
                  <StatNumber>0</StatNumber>
                </Box>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  No pending tasks
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    Recent Alerts
                  </Typography>
                  <StatNumber>0</StatNumber>
                </Box>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  No recent alerts
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        <Paper sx={{ 
          p: 4, 
          mt: 4, 
          borderRadius: 3,
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#1e293b',
              mb: 3,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Quick Actions
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 3, // Increased gap for better spacing with two buttons
          }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/admin/users')} // Added navigation handler
              sx={{ 
                px: 4, 
                py: 1.5,
                backgroundColor: '#3b82f6',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#2563eb',
                  boxShadow: 'none',
                },
              }}
            >
              View Users
            </Button>
            <Button 
              variant="contained"
              onClick={() => navigate('/admin/reports')}  // Add onClick handler
              sx={{ 
                px: 4, 
                py: 1.5,
                backgroundColor: '#f50057',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#c51162',
                  boxShadow: 'none',
                },
              }}
            >
              Generate Reports
            </Button>
          </Box>
        </Paper>

        {/* Add a recent activity section */}
        <Paper sx={{ 
          p: 4, 
          mt: 4, 
          borderRadius: 3,
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#1e293b',
              mb: 3,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Recent Activity
          </Typography>
          {/* Add activity list or timeline here */}
        </Paper>
      </Main>
    </Box>
  );
}

export default AdminDashboard;
