import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  FormLabel,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';

function EditProfile() {
  const [formData, setFormData] = useState({
    salutation: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    fatherName: '',
    spouseName: '',
    motherName: '',
    houseName: '',
    floorNo: '',
    housingComplex: '',
    streetName: '',
    landmark: '',
    city: '',
    state: '',
    district: '',
    pinCode: '',
    mobileNumber: '',
    email: '',
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const salutations = ['Mr.', 'Mrs.'];

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const userRes = await fetch('http://localhost:5000/api/user/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          const userEmail = userData.email;

          if (userEmail) {
            const kycRes = await fetch(`http://localhost:5000/api/kyc/user/me?email=${encodeURIComponent(userEmail)}`);
            
            if (kycRes.ok) {
              const kycData = await kycRes.json();
              if (kycData) {
                if (kycData.dob) {
                  kycData.dob = new Date(kycData.dob).toISOString().split('T')[0];
                }
                setFormData(kycData);
              } else {
                alert("Please complete the 'New Connection' form first.");
                navigate('/kyc');
              }
            } else if (kycRes.status === 404) {
              alert("Please complete the 'New Connection' form first.");
              navigate('/kyc');
            }
          }
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'pinCode' || name === 'mobileNumber') {
      processedValue = value.replace(/\D/g, '').slice(0, name === 'pinCode' ? 6 : 10);
    } else if (name === 'email') {
      processedValue = value.toLowerCase().trim();
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Show age validation message immediately when typing DOB
    if (name === 'dob') {
      const maxDate = getMaxDateForAge18();
      if (processedValue && processedValue > maxDate) {
        setErrors(prev => ({ ...prev, dob: 'You must be at least 18 years old to take the connection.' }));
      } else {
        setErrors(prev => ({ ...prev, dob: '' }));
      }
      return;
    }

    // Clear error when user starts typing other fields
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getMaxDateForAge18 = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.dob) {
      newErrors.dob = 'Date of Birth is required.';
    } else {
      // Only allow DOB for users who are at least 18 years old as of today
      const maxDate = getMaxDateForAge18();
      if (formData.dob > maxDate) {
        newErrors.dob = 'You must be at least 18 years old to take the connection.';
      }
    }

    if (!formData.mobileNumber || !/^[987]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Enter valid 10-digit mobile number starting with 9, 8, or 7';
    }

    if (!formData.pinCode || formData.pinCode.length !== 6) {
      newErrors.pinCode = 'Pin code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/kyc/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/profileupdated', { state: { updatedProfile: formData } });
        }, 2000);
      } else {
        const err = await res.json();
        alert(err.message || 'Update failed');
      }
    } catch (error) {
      alert('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.email) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, position: 'relative' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            variant="outlined"
            color="secondary"
            sx={{ position: 'absolute', left: 0 }}
          >
            Back
          </Button>
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            color="primary"
            fontWeight="bold"
          >
            Edit Profile
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Personal Details Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                1) Personal Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Salutation</InputLabel>
                    <Select
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                      label="Salutation"
                    >
                      <MenuItem value=""><em>--Select--</em></MenuItem>
                      {salutations.map(s => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: getMaxDateForAge18() }}
                    error={!!errors.dob}
                    helperText={errors.dob}
                  />
                </Grid>
              </Grid>

              {/* Close Relative Section */}
              <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary' }}>
                  Close Relative (Fill at least one)
                </FormLabel>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Father's Name"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Mother's Name"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Spouse Name"
                      name="spouseName"
                      value={formData.spouseName}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                2) Address for LPG connection / Contact Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="House / Flat #, Name *"
                    name="houseName"
                    value={formData.houseName}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Floor No"
                    name="floorNo"
                    value={formData.floorNo}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Housing Complex/Building"
                    name="housingComplex"
                    value={formData.housingComplex}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street/Road Name"
                    name="streetName"
                    value={formData.streetName}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Landmark *"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City/Town/Village"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State *"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="District *"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pin Code"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    required
                    error={!!errors.pinCode}
                    helperText={errors.pinCode}
                    inputProps={{ maxLength: 6 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number *"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber}
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email ID *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    InputProps={{ readOnly: true }}
                    placeholder="Email cannot be changed"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Save />}
              disabled={loading}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #00ACC1 90%)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Update Profile'}
            </Button>
          </Box>

          {/* Success Message */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ mt: 3 }}
              action={
                <Button color="inherit" size="small" onClick={() => setSuccess(false)}>
                  UNDO
                </Button>
              }
            >
              Profile updated successfully! Redirecting...
            </Alert>
          )}
        </form>
      </Paper>
    </Box>
  );
}

export default EditProfile;