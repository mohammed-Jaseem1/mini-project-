import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Fade
} from "@mui/material";
import {
  CheckCircle,
  Dashboard,
  Person,
  ArrowBack
} from "@mui/icons-material";

export default function ProfileUpdated() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(location.state?.updatedProfile || null);
  const [loading, setLoading] = useState(!location.state?.updatedProfile);

  useEffect(() => {
    if (!user) {
      async function fetchUser() {
        try {
          setLoading(true);
          const res = await fetch("http://localhost:5000/api/user/me", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user]);

  function formatKey(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase())
      .replace(/(\b\w)/g, txt => txt.toUpperCase());
  }

  const shouldDisplay = (key, value) => {
    const excludedKeys = ['_id', '__v', 'password', 'createdAt', 'updatedAt'];
    return !excludedKeys.includes(key) && value !== '' && value !== null && value !== undefined;
  };

  const getCategory = (key) => {
    const personalKeys = ['salutation', 'firstName', 'middleName', 'lastName', 'dob', 'fatherName', 'spouseName', 'motherName'];
    const addressKeys = ['houseName', 'floorNo', 'housingComplex', 'streetName', 'landmark', 'city', 'state', 'district', 'pinCode'];
    const contactKeys = ['mobileNumber', 'email'];
    
    if (personalKeys.includes(key)) return 'personal';
    if (addressKeys.includes(key)) return 'address';
    if (contactKeys.includes(key)) return 'contact';
    return 'other';
  };

  const categories = {
    personal: { title: 'Personal Information', icon: <Person />, color: 'primary' },
    address: { title: 'Address Details', icon: <Person />, color: 'secondary' },
    contact: { title: 'Contact Information', icon: <Person />, color: 'success' },
    other: { title: 'Additional Details', icon: <Person />, color: 'info' }
  };

  const groupedData = user ? Object.entries(user).reduce((acc, [key, value]) => {
    if (shouldDisplay(key, value)) {
      const category = getCategory(key);
      if (!acc[category]) acc[category] = [];
      acc[category].push({ key, value });
    }
    return acc;
  }, {}) : {};

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading your profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header Section */}
          <Box textAlign="center" mb={6}>
            <CheckCircle 
              sx={{ 
                fontSize: 80, 
                color: 'success.main',
                mb: 2
              }} 
            />
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              fontWeight="bold"
              color="success.main"
            >
              Profile Updated Successfully!
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Your profile changes have been saved and updated in our system.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Dashboard />}
                onClick={() => navigate('/userdash')}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00ACC1 90%)',
                  }
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
              >
                Back to Edit
              </Button>
            </Box>
          </Box>

          {/* Profile Details */}
          {user ? (
            <Grid container spacing={4}>
              {Object.entries(groupedData).map(([category, items]) => (
                <Grid item xs={12} md={6} key={category}>
                  <Card 
                    elevation={4}
                    sx={{
                      height: '100%',
                      border: `2px solid`,
                      borderColor: `${categories[category].color}.light`,
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={3}>
                        <Box
                          sx={{
                            color: `${categories[category].color}.main`,
                            mr: 2
                          }}
                        >
                          {categories[category].icon}
                        </Box>
                        <Typography
                          variant="h5"
                          component="h2"
                          color={`${categories[category].color}.main`}
                          fontWeight="bold"
                        >
                          {categories[category].title}
                        </Typography>
                      </Box>

                      <Divider sx={{ mb: 3 }} />

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {items.map(({ key, value }) => (
                          <Paper
                            key={key}
                            elevation={1}
                            sx={{
                              p: 2,
                              background: 'white',
                              borderRadius: 2,
                              borderLeft: `4px solid`,
                              borderColor: `${categories[category].color}.main`
                            }}
                          >
                            <Grid container spacing={1}>
                              <Grid item xs={12} sm={5}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  fontWeight="bold"
                                  sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}
                                >
                                  {formatKey(key)}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={7}>
                                <Typography
                                  variant="body1"
                                  color="text.primary"
                                  fontWeight="500"
                                  sx={{
                                    wordBreak: 'break-word',
                                    lineHeight: 1.4
                                  }}
                                >
                                  {String(value) || 'Not provided'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert 
              severity="error" 
              sx={{ 
                maxWidth: 600, 
                mx: 'auto',
                '& .MuiAlert-message': { textAlign: 'center' }
              }}
            >
              <Typography variant="h6" gutterBottom>
                Unable to Load Profile
              </Typography>
              <Typography variant="body2">
                We couldn't retrieve your profile information. Please try again later.
              </Typography>
            </Alert>
          )}

          {/* Additional Success Message */}
          <Box textAlign="center" mt={6}>
            <Chip
              label="Profile Successfully Updated"
              color="success"
              variant="filled"
              sx={{ 
                fontSize: '1.1rem', 
                py: 2,
                px: 1
              }}
            />
          </Box>
        </Box>
      </Fade>
    </Container>
  );
}