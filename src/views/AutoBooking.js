import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Grid
} from '@mui/material';
import { ArrowBack, LocalGasStation, Email, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import '../styles/AutoBooking.css';

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
        setError(err.response?.data?.error || "Failed to fetch bookings");
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

  const getGasLevelColor = (level) => {
    if (level < 20) return 'error';
    if (level < 40) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={50} className="loading-spinner" />
        <Typography variant="h6">Loading bookings...</Typography>
      </Box>
    );
  }

  return (
    <div className="auto-booking-page">
      <Container maxWidth="lg" className="page-container">
        {/* Header */}
        <Card className="page-header">
          <Box className="header-content">
            <Box className="header-main">
              <IconButton onClick={() => navigate(-1)} className="back-button">
                <ArrowBack />
              </IconButton>
              <Box className="title-section">
                <LocalGasStation className="header-icon" />
                <Box>
                  <Typography variant="h4" className="page-title">
                    Auto Bookings
                  </Typography>
                  <Typography variant="body1" className="page-subtitle">
                    Manage automatic gas refill requests
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box className="header-stats">
              <Box className="stat-item">
                <Typography variant="h6" className="stat-number">
                  {bookings.length}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Total Bookings
                </Typography>
              </Box>
              <Box className="stat-item">
                <Typography variant="h6" className="stat-number">
                  {bookings.filter(b => b.refillStatus === 'Pending').length}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Pending
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {error && (
          <Alert severity="error" className="error-alert">
            {error}
          </Alert>
        )}

        {/* Bookings Grid */}
        <Grid container spacing={3} className="bookings-grid">
          {bookings.length === 0 ? (
            <Grid item xs={12}>
              <Card className="empty-card">
                <Box className="empty-state">
                  <LocalGasStation className="empty-icon" />
                  <Typography variant="h6">No bookings found</Typography>
                  <Typography variant="body2">No automatic bookings available</Typography>
                </Box>
              </Card>
            </Grid>
          ) : (
            bookings.map((booking) => (
              <Grid item xs={12} md={6} lg={4} key={booking._id}>
                <Card className="booking-card">
                  <Box className="booking-header">
                    <Typography variant="h6" className="user-name">
                      {/* Show username if available, else fallback to email or "Unknown User" */}
                      {booking.userId?.username || booking.userId?.name || booking.userId?.email || booking.email || "Unknown User"}
                    </Typography>
                    <Chip
                      label={booking.refillStatus}
                      color={getStatusColor(booking.refillStatus)}
                      size="small"
                      className="status-chip"
                    />
                  </Box>
                  <Box className="booking-details">
                    <Box className="detail-item">
                      <Email className="detail-icon" />
                      <Typography variant="body2" className="detail-text">
                        {booking.userId?.email || booking.email || "N/A"}
                      </Typography>
                    </Box>

                    <Box className="detail-item">
                      <LocalGasStation className="detail-icon" />
                      <Box className="gas-level">
                        <Typography variant="body2" className="gas-label">
                          Gas Level
                        </Typography>
                        <Chip
                          label={`${booking.gasLevel}%`}
                          color={getGasLevelColor(booking.gasLevel)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    <Box className="detail-item">
                      <Schedule className="detail-icon" />
                      <Box>
                        <Typography variant="body2" className="date-text">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" className="time-text">
                          {new Date(booking.bookingDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </div>
  );
};

export default AutoBooking;