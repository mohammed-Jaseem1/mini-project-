import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { ArrowBack, LocalGasStation } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const AutoBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/autobookings", {
          withCredentials: true
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.error || "Failed to fetch bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'warning',
      Confirmed: 'info',
      Completed: 'success',
      Cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        gap: 2 
      }}>
        <Tooltip title="Back">
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          <LocalGasStation sx={{ fontSize: 32, color: 'primary.main' }} />
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
        <TableContainer 
          component={Paper} 
          elevation={2}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ 
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  letterSpacing: '0.1px'
                }}>
                  User
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Gas Level (%)</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Booking Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow 
                  key={booking._id}
                  sx={{ 
                    '&:hover': { bgcolor: 'grey.50' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell sx={{ color: 'text.primary' }}>
                    {booking.userId?.name || "N/A"}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {booking.userId?.email || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1 
                    }}>
                      <Typography 
                        component="span" 
                        sx={{ 
                          color: booking.gasLevel < 20 ? 'error.main' : 'success.main',
                          fontWeight: 500
                        }}
                      >
                        {booking.gasLevel}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {new Date(booking.bookingDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.refillStatus}
                      color={getStatusColor(booking.refillStatus)}
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        minWidth: 85,
                        textAlign: 'center'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AutoBooking;

