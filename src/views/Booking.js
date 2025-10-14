import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  AppBar,
  Toolbar
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axios from "axios";

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

const AutoBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAutoBookings = async () => {
      try {
        const userRes = await axios.get("http://localhost:5000/api/user/me", {
          withCredentials: true
        });
        
        if (!userRes.data?.email) {
          throw new Error('User email not found');
        }

        const res = await axios.get(`http://localhost:5000/api/gas/auto-bookings/${userRes.data.email}`, {
          withCredentials: true
        });

        if (Array.isArray(res.data)) {
          setBookings(res.data);
        } else {
          setError("Invalid booking data received");
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.error || "Failed to fetch your auto bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAutoBookings();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ backgroundColor: '#0a192f' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Auto Booking History
          </Typography>
        </Toolbar>
      </AppBar>

      <Main>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/history')} sx={{ color: '#e0e0e0', mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ color: '#e0e0e0' }}>
            Auto Booking Management
          </Typography>
        </Box>

        {error ? (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-icon': { alignItems: 'center' }
            }}
          >
            {error}
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: '#162447' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Gas Level (%)</StyledTableCell>
                  <StyledTableCell>Booking Date</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <StyledTableCell>{booking.email}</StyledTableCell>
                    <StyledTableCell>
                      <Typography sx={{ 
                        color: booking.gasLevel < 20 ? '#ef5350' : '#4caf50',
                        fontWeight: 500 
                      }}>
                        {booking.gasLevel}%
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      {new Date(booking.bookingDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography
                        component="span"
                        sx={{
                          borderRadius: '4px',
                          padding: '4px 8px',
                          backgroundColor:
                            booking.refillStatus === 'Completed'
                              ? '#27a644'
                              : booking.refillStatus === 'Cancelled'
                              ? '#d32f2f'
                              : '#ed6c02',
                          color: '#ffffff',
                        }}
                      >
                        {booking.refillStatus === 'Cancelled'
                          ? 'Cancelled'
                          : booking.refillStatus === 'Completed'
                          ? 'Completed'
                          : 'Pending'}
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

export default AutoBooking;

