import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Alert,
  CircularProgress,
  useTheme,
  ListItemIcon // Add this import
} from '@mui/material';
import {
  Edit,
  Logout
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // For the graph


const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64, // To account for the fixed AppBar
  backgroundColor: '#1a1a2e', // Dark background for the main content area
  minHeight: 'calc(100vh - 64px)', // Ensure it takes full height below app bar
}));

const CardStyled = styled(Card)(({ theme }) => ({
  backgroundColor: '#162447', // Darker blue for cards
  color: '#e0e0e0', // Light text
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
}));

const AlertStatusCard = styled(Card)(({ theme, status }) => ({
  backgroundColor: status === 'Normal' ? '#27a644' : '#d32f2f', // Green for Normal, Red for Alert
  color: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const GasLevelChartCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#162447',
  color: '#e0e0e0',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
  padding: theme.spacing(2),
}));

const TableStyled = styled('table')(({ theme }) => ({
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: theme.spacing(2),
  '& th, & td': {
    padding: theme.spacing(1.5),
    textAlign: 'left',
    borderBottom: '1px solid #334b6b', // Lighter border for table rows
    color: '#e0e0e0',
  },
  '& th': {
    fontWeight: 'bold',
    color: '#8e9aaf', // Lighter color for table headers
  },
}));

const TubeTypeCard = styled(Card)(({ theme, tubeType }) => ({
  backgroundColor: tubeType === 'Domestic' ? '#4a4a4a' : '#1976d2', // Grey for Domestic, Blue for Commercial
  color: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const GasMonitorDashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [gasData, setGasData] = useState(null);
  const [error, setError] = useState("");
  const [approved, setApproved] = useState(null);
  const [autoBookingMessage, setAutoBookingMessage] = useState('');
  const [connectionDetails, setConnectionDetails] = useState({
    date: null,
    type: 'Domestic',
    testYears: 15
  });
  const theme = useTheme(); // Access the theme palette

  const dropdownRef = useRef();
  const alarmRef = useRef(null);
  const navigate = useNavigate();

  // Mock data for the graph (replace with real data from backend)
  const graphData = [
    { name: 'Mon', pv: 15 },
    { name: 'Tue', pv: 22 },
    { name: 'Wed', pv: 18 },
    { name: 'Thu', pv: 25 },
    { name: 'Fri', pv: 35 },
    { name: 'Sat', pv: 28 },
    { name: 'Sun', pv: 38 },
  ];

  // Helper function to determine status based on gas level
  const getStatusFromLevel = (level) => {
    if (level < 15) return 'Normal';
    if (level < 25) return 'Warning';
    return 'Danger';
  };

  // Dynamic recent alerts based on gasData
  const recentAlerts = gasData ? [
    { 
      timestamp: new Date().toLocaleString(),
      device: 'Main Sensor',
      type: 'LPG',
      level: `${gasData.gasLevel} ppm`,
      status: getStatusFromLevel(gasData.gasLevel)
    },
    { 
      timestamp: new Date(Date.now() - 30*60000).toLocaleString(), // 30 minutes ago
      device: 'Main Sensor',
      type: 'LPG',
      level: `${Math.max(0, gasData.gasLevel - 2)} ppm`,
      status: getStatusFromLevel(Math.max(0, gasData.gasLevel - 2))
    },
    { 
      timestamp: new Date(Date.now() - 60*60000).toLocaleString(), // 1 hour ago
      device: 'Main Sensor',
      type: 'LPG',
      level: `${Math.max(0, gasData.gasLevel - 5)} ppm`,
      status: getStatusFromLevel(Math.max(0, gasData.gasLevel - 5))
    }
  ] : [];

  // ✅ Check for admin approval
  useEffect(() => {
    async function checkApproval() {
      try {
        // Always get the logged-in user's email first
        const userRes = await fetch("http://localhost:5000/api/user/me", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        let userEmail = "";
        if (userRes.ok) {
          const userData = await userRes.json();
          userEmail = userData.email;
        }
        // Now check KYC status for this email
        const res = await fetch(`http://localhost:5000/api/kyc/status-and-action?email=${encodeURIComponent(userEmail)}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          // Debug: log the returned status
          console.log("KYC status response:", data);
          // Allow dashboard if status is approved or redirectToPayment is true
          const isApproved = data.status === "approved" || data.redirectToPayment === true;
          setApproved(isApproved);
          if (!isApproved) {
            navigate("/waitingapproval");
          }
        } else {
          setApproved(false);
          navigate("/waitingapproval");
        }
      } catch (err) {
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
          // Check gas level and set auto-booking message
          if (data.gasLevel <= 20 && !localStorage.getItem('autoBookingMessageDismissed')) {
            setAutoBookingMessage('LPG cylinder has been automatically booked due to low gas level. Please proceed with the online payment to refill the cylinder.');
          } else {
            setAutoBookingMessage('');
          }
          setError("");
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

  // Initialize a single Audio instance
  useEffect(() => {
    alarmRef.current = new Audio('/alarm.mp3');
    if (alarmRef.current) {
      alarmRef.current.loop = true;
    }
  }, []);

  // Unlock audio on first user gesture (autoplay policy)
  useEffect(() => {
    const unlock = () => {
      if (!alarmRef.current) return;
      alarmRef.current.play()
        .then(() => {
          alarmRef.current.pause();
          alarmRef.current.currentTime = 0;
        })
        .catch(() => { /* ignore; will try again later */ });
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  // Refill gas after successful payment
  useEffect(() => {
    const paymentDone = localStorage.getItem('gasRefilled');
    if (paymentDone) {
      setGasData(prev => prev ? { ...prev, gasLevel: 100, alertMessage: '' } : prev);
      localStorage.removeItem('gasRefilled');
    }
  }, [gasData]);

  // Note: MUI Menu handles outside clicks via onClose; no manual listeners needed here

  const handleProfileClick = () => setDropdownOpen((open) => !open);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Play/pause alarm and show notification when gas leakage changes
  useEffect(() => {
    const isLeak = !!gasData?.leakageDetected;
    if (!alarmRef.current) return;
    if (isLeak) {
      alarmRef.current.play().catch(e => console.error('Alarm play failed:', e));

      if (typeof Notification !== 'undefined') {
        if (Notification.permission === 'granted') {
          new Notification('Gas Leakage Alert!', {
            body: gasData?.alertMessage || 'Immediate action required: Gas leakage detected!',
            icon: '/alert-icon.png',
            vibrate: [200, 100, 200]
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Gas Leakage Alert!', {
                body: gasData?.alertMessage || 'Immediate action required: Gas leakage detected!',
                icon: '/alert-icon.png',
                vibrate: [200, 100, 200]
              });
            }
          });
        }
      }
    } else {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
  }, [gasData?.leakageDetected, gasData?.alertMessage]);

  // Add this effect after other useEffects
  useEffect(() => {
    const fetchConnectionDetails = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/kyc/user/me", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setConnectionDetails({
            date: new Date(data.createdAt),
            type: data.connectionType || 'Domestic', // Default to Domestic if not specified
            testYears: data.connectionType === 'Commercial' ? 10 : 15 // 10 years for Commercial, 15 for Domestic
          });
        }
      } catch (err) {
        console.error('Error fetching connection details:', err);
      }
    };
    fetchConnectionDetails();
  }, []);

  // Add this new effect to fetch KYC details for connection date
  useEffect(() => {
    const fetchConnectionDate = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/kyc/requests?email=" + encodeURIComponent(localStorage.getItem('userEmail')), {
          credentials: "include"
        });
        
        if (res.ok) {
          const kycData = await res.json();
          const approvedRequest = kycData.find(req => req.status === 'approved');
          
          if (approvedRequest) {
            setConnectionDetails({
              date: new Date(approvedRequest.createdAt),
              type: approvedRequest.connectionType || 'Domestic',
              testYears: approvedRequest.connectionType === 'Commercial' ? 10 : 15
            });
          }
        }
      } catch (err) {
        console.error('Error fetching connection date:', err);
      }
    };
    fetchConnectionDate();
  }, []);

  // Add helper function for date calculations
  const calculateNextTestDate = (connectionDate, years = 5) => {
    if (!connectionDate) return 'Loading...';
    const nextTest = new Date(connectionDate);
    nextTest.setFullYear(nextTest.getFullYear() + years);
    return nextTest.toLocaleDateString();
  };

  if (approved === false) {
    return null; // or show a loading spinner
  }

  const appBarColor = '#0a192f'; // Darker blue for AppBar

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, backgroundColor: appBarColor }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#e0e0e0' }}>
            GasWatch
          </Typography>
          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button color="inherit" onClick={() => navigate("/userdash")} sx={{ color: '#e0e0e0' }}>Dashboard</Button>
            <Button color="inherit" onClick={() => navigate("/payment")} sx={{ color: '#e0e0e0' }}>Payment</Button>
            <Button color="inherit" onClick={() => navigate("/feedback")} sx={{ color: '#e0e0e0' }}>Feedback</Button>
            <Button color="inherit" onClick={() => navigate("/history")} sx={{ color: '#e0e0e0' }}>History</Button>
          </Box>
          <IconButton
            onClick={handleProfileClick}
            sx={{ ml: 2 }}
            ref={dropdownRef} // Attach ref here
          >
            <Avatar />
          </IconButton>
          <Menu
            anchorEl={dropdownRef.current}
            open={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                backgroundColor: appBarColor, // Dark background for dropdown
                color: '#e0e0e0', // Light text for dropdown
              },
            }}
          >
            <MenuItem onClick={() => {
              setDropdownOpen(false);
              navigate("/editprofile");
            }}>
              <ListItemIcon><Edit fontSize="small" sx={{ color: '#e0e0e0' }} /></ListItemIcon>
              Edit Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: '#e0e0e0' }} /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Main>
        <Box sx={{ marginBottom: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#e0e0e0' }}>
            Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#8e9aaf' }}>
            Overview of your gas monitoring system
          </Typography>
        </Box>

        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : !gasData ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {gasData.alertMessage && (
              <Alert 
                severity={gasData.leakageDetected ? "error" : "warning"}
                action={
                  gasData.gasLevel <= 20 &&
                  gasData.alertMessage !== "CRITICAL: Gas Leak Detected AND Low Tank!" && (
                    <Box>
                      <Button color="inherit" size="small" onClick={() => navigate('/payment')}>
                        Payment
                      </Button>
                      <Button color="inherit" size="small" onClick={() => {
                        setGasData({ ...gasData, alertMessage: '' });
                        localStorage.setItem('refillMessageDismissed', 'true');
                      }}>
                        Cancel
                      </Button>
                    </Box>
                  )
                }
                sx={{ backgroundColor: gasData.leakageDetected ? '#d32f2f' : '#ed6c02', color: '#ffffff', mb: 4 }}
              >
                {gasData.alertMessage.split('\n').map((msg, idx) => (
                  <div key={idx}>{msg}</div>
                ))}
              </Alert>
            )}

            {autoBookingMessage && (
              <Alert 
                severity="info"
                sx={{ 
                  mb: 4,
                  backgroundColor: '#1976d2',
                  color: '#ffffff',
                  '& .MuiAlert-icon': {
                    color: '#ffffff'
                  }
                }}
                action={
                  <Box>
                    <Button color="inherit" size="small" onClick={() => navigate('/payment')}>
                      Payment
                    </Button>
                    <Button
                      color="inherit"
                      size="small"
                      onClick={async () => {
                        try {
                          // Find the pending booking for this user
                          const userRes = await fetch("http://localhost:5000/api/user/me", {
                            credentials: "include"
                          });
                          const userData = await userRes.json();
                          const bookingsRes = await fetch(`http://localhost:5000/api/gas/auto-bookings/${userData.email}`, {
                            credentials: "include"
                          });
                          const bookings = await bookingsRes.json();
                          const pendingBooking = bookings.find(b => b.refillStatus === "Pending");
                          if (pendingBooking) {
                            await fetch(`http://localhost:5000/api/bookings/cancel/${pendingBooking._id}`, {
                              method: "PUT",
                              credentials: "include"
                            });
                          }
                        } catch (err) {
                          // Optionally show error
                        }
                        setAutoBookingMessage('');
                        localStorage.setItem('autoBookingMessageDismissed', 'true');
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                }
              >
                {autoBookingMessage}
              </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <CardStyled sx={{ minHeight: 150 }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="#8e9aaf" gutterBottom>
                      Current Gas Level
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}> {/* Green for gas level */}
                      {gasData.gasLevel ?? 15} ppm
                    </Typography>
                  </CardContent>
                </CardStyled>
              </Grid>

              <Grid item xs={12} md={4}>
                <AlertStatusCard status={gasData.leakageDetected ? 'Alert' : 'Normal'} sx={{ minHeight: 150 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" color="inherit" gutterBottom>
                      Alert Status
                    </Typography>
                    <Typography variant="h3" sx={{ color: 'inherit', fontWeight: 'bold' }}>
                      {gasData.leakageDetected ? "Alert" : "Normal"}
                    </Typography>
                  </CardContent>
                </AlertStatusCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <CardStyled sx={{ minHeight: 150 }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="#8e9aaf" gutterBottom>
                      Device Health
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}> {/* Green for Online */}
                      Online
                    </Typography>
                  </CardContent>
                </CardStyled>
              </Grid>

              <Grid item xs={12} md={6}>
                <TubeTypeCard tubeType="Domestic" sx={{ minHeight: 150 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" color="inherit" gutterBottom>
                      Domestic LPG Cylinder
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'inherit', fontWeight: 'bold', mb: 1 }}>
                      Grey/Red • Household Use
                    </Typography>
                    <Typography variant="body2">
                      Next Test: {calculateNextTestDate(connectionDetails.date, 5)}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                      Connection Date: {connectionDetails.date ? 
                        connectionDetails.date.toLocaleDateString() : 'Loading...'}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#ffd700' }}>
                      Test Required Every 5 Years
                    </Typography>
                  </CardContent>
                </TubeTypeCard>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ color: '#e0e0e0', mt: 4 }}>
              Gas Levels Over Time
            </Typography>
            <Typography variant="body2" sx={{ color: '#8e9aaf', mb: 2 }}>
              Last: 7 Days <span style={{ color: '#d32f2f' }}>-2%</span>
            </Typography>
            <GasLevelChartCard sx={{ mb: 4, height: 300, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: theme.spacing(2), right: theme.spacing(2), color: '#e0e0e0', fontWeight: 'bold', fontSize: '1.5rem' }}>
                {gasData.gasLevel ?? 15} ppm
              </Box>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={graphData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334b6b" />
                  <XAxis dataKey="name" stroke="#8e9aaf" />
                  <YAxis stroke="#8e9aaf" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #334b6b', color: '#e0e0e0' }}
                    itemStyle={{ color: '#e0e0e0' }}
                    labelStyle={{ color: '#e0e0e0' }}
                  />
                  <Line type="monotone" dataKey="pv" stroke="#00C49F" strokeWidth={3} dot={{ stroke: '#00C49F', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </GasLevelChartCard>

            <Typography variant="h6" gutterBottom sx={{ color: '#e0e0e0', mt: 4 }}>
              Recent Alerts
            </Typography>
            <CardStyled sx={{ mb: 4 }}>
              <CardContent>
                <TableStyled>
                  <thead>
                    <tr>
                      <th>TIMESTAMP</th>
                      <th>DEVICE</th>
                      <th>TYPE</th>
                      <th>LEVEL</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAlerts.map((alert, index) => (
                      <tr key={index}>
                        <td>{alert.timestamp}</td>
                        <td>{alert.device}</td>
                        <td>{alert.type}</td>
                        <td>{alert.level}</td>
                        <td>
                          <Typography
                            component="span"
                            sx={{
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontWeight: 'bold',
                              backgroundColor: alert.status === 'Normal' ? '#27a644' : '#ed6c02',
                              color: '#ffffff',
                            }}
                          >
                            {alert.status}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </TableStyled>
              </CardContent>
            </CardStyled>

            <Typography variant="h6" gutterBottom sx={{ color: '#e0e0e0', mt: 4 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#162447',
                  color: '#e0e0e0',
                  '&:hover': {
                    backgroundColor: '#1f3a61',
                  },
                }}
                onClick={() => navigate('/payment')}
              >
                Make Payment
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#162447',
                  color: '#e0e0e0',
                  '&:hover': {
                    backgroundColor: '#1f3a61',
                  },
                }}
                onClick={() => navigate('/feedback')}
              >
                Send Feedback
              </Button>
            </Box>
          </>
        )}
      </Main>
    </Box>
  );
};

export default GasMonitorDashboard;