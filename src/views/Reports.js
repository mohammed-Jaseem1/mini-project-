import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button, // Add this import
  styled
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material'; // Add this import
import axios from 'axios';

const StyledTableCell = styled(TableCell)({
  backgroundColor: '#162447',
  color: '#e0e0e0',
  borderBottom: '1px solid #334b6b',
});

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64,
  backgroundColor: '#1a1a2e',
  minHeight: 'calc(100vh - 64px)',
}));

const Reports = () => {
  const navigate = useNavigate(); // Add this hook
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState({
    users: [],
    payments: [],
    gasUsage: []
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [usersRes, paymentsRes, gasRes] = await Promise.all([
          axios.get('http://localhost:5000/api/kyc/requests', { 
            withCredentials: true 
          }),
          axios.get('http://localhost:5000/api/payment', { 
            withCredentials: true 
          }),
          axios.get('http://localhost:5000/api/gas/all-readings', { // Changed endpoint
            withCredentials: true 
          })
        ]);

        setReports({
          users: usersRes.data || [],
          payments: paymentsRes.data || [],
          gasUsage: gasRes.data || [] // Now gets all users' gas readings
        });
      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.message || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ backgroundColor: '#0a192f' }}>
        <Toolbar>
          <Button
            onClick={() => navigate(-1)}
            sx={{ 
              color: '#e0e0e0', 
              mr: 2,
              minWidth: 'auto',
              padding: '8px',
              '&:hover': {
                backgroundColor: 'rgba(224, 224, 224, 0.1)'
              }
            }}
          >
            <ArrowBack />
          </Button>
          <Typography variant="h6">Admin Reports</Typography>
        </Toolbar>
      </AppBar>

      <Main>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ mb: 3, '& .MuiTab-root': { color: '#e0e0e0' } }}
        >
          <Tab label="User Statistics" />
          <Tab label="Payment History" />
          <Tab label="Gas Usage" />
        </Tabs>

        {activeTab === 0 && (
          <TableContainer component={Paper} sx={{ backgroundColor: '#162447' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Registration Date</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Last Active</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.users.map(user => (
                  <TableRow key={user._id}>
                    <StyledTableCell>{user.email}</StyledTableCell>
                    <StyledTableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </StyledTableCell>
                    <StyledTableCell>{user.status}</StyledTableCell>
                    <StyledTableCell>
                      {new Date(user.lastActive).toLocaleDateString()}
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && (
          <TableContainer component={Paper} sx={{ backgroundColor: '#162447' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>User</StyledTableCell>
                  <StyledTableCell>Amount</StyledTableCell>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.payments.map(payment => (
                  <TableRow key={payment._id}>
                    <StyledTableCell>{payment.gmail}</StyledTableCell>
                    <StyledTableCell>₹{payment.amountPaid}</StyledTableCell>
                    <StyledTableCell>
                      {new Date(payment.date).toLocaleDateString()}
                    </StyledTableCell>
                    <StyledTableCell>{payment.approved ? 'Completed' : 'Pending'}</StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 2 && (
          <TableContainer component={Paper} sx={{ backgroundColor: '#162447' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>User</StyledTableCell>
                  <StyledTableCell>Gas Level (ppm)</StyledTableCell>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.gasUsage.map((reading, index) => (
                  <TableRow key={reading._id || index}>
                    <StyledTableCell>{reading.gmail || 'Unknown'}</StyledTableCell>
                    <StyledTableCell>{reading.gasLevel} ppm</StyledTableCell>
                    <StyledTableCell>
                      {new Date(reading.createdAt).toLocaleDateString()}
                    </StyledTableCell>
                    <StyledTableCell>
                      {reading.leakageDetected ? 'Leakage Detected' : 'Normal'}
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Main>
    </Box>
  );
};

export default Reports;
