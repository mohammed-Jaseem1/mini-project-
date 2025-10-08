import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, IconButton, Typography,
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert,
  Tabs, Tab
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64,
  backgroundColor: '#1a1a2e',
  minHeight: 'calc(100vh - 64px)',
}));

const StyledTableCell = styled(TableCell)({
  backgroundColor: '#162447',
  color: '#e0e0e0',
  borderBottom: '1px solid #334b6b',
});

const History = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        const userRes = await fetch('http://localhost:5000/api/user/me', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const userData = await userRes.json();

        // Fetch payment history first
        const paymentRes = await fetch(`http://localhost:5000/api/payment/user-history/${userData.email}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        let payments = [];
        if (paymentRes.ok) {
          payments = await paymentRes.json();
        }

        // Try to fetch booking history
        let bookings = [];
        try {
          const bookingRes = await fetch(`http://localhost:5000/api/gas/booking-history/${userData.email}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (bookingRes.ok) {
            bookings = await bookingRes.json();
          }
        } catch (bookingErr) {
          console.warn('Could not fetch booking history:', bookingErr);
        }

        // Combine and format history
        const combinedPayments = payments.map(p => ({
          date: new Date(p.date).toLocaleDateString(),
          type: 'Online',  // Changed from 'Manual Payment' to 'Online'
          amount: `₹${p.amountPaid}`,
          status: p.approved ? 'Completed' : 'Pending'
        }));

        const combinedBookings = bookings.map(b => ({
          date: new Date(b.createdAt).toLocaleDateString(),
          type: 'Online',  // Changed from 'Auto Booking' to 'Online'
          amount: `₹${b.totalAmount}`,
          status: b.refillStatus
        }));

        setPayments(combinedPayments);
        setBookings(combinedBookings);
        setError(null);
      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to load history');
        setPayments([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      navigate('/booking'); // Updated path to match router
    }
  };

  const displayData = activeTab === 0 ? payments : bookings;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ backgroundColor: '#0a192f' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            History
          </Typography>
        </Toolbar>
      </AppBar>

      <Main>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/userdash')} sx={{ color: '#e0e0e0', mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ color: '#e0e0e0', mr: 4 }}>
            Transaction History
          </Typography>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': { color: '#e0e0e0' },
              '& .Mui-selected': { color: '#4caf50' }
            }}
          >
            <Tab label="Payments" />
            <Tab label="Bookings" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: '#162447' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell>Type</StyledTableCell>
                  <StyledTableCell>Amount</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayData.map((item, index) => (
                  <TableRow key={index}>
                    <StyledTableCell>
                      {item.date}
                    </StyledTableCell>
                    <StyledTableCell>{item.type}</StyledTableCell>
                    <StyledTableCell>{item.amount}</StyledTableCell>
                    <StyledTableCell>
                      <Typography
                        component="span"
                        sx={{
                          borderRadius: '4px',
                          padding: '4px 8px',
                          backgroundColor: item.status === 'Completed' ? '#27a644' : '#ed6c02',
                          color: '#ffffff',
                        }}
                      >
                        {item.status}
                      </Typography>
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

export default History;
