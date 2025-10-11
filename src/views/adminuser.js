import React, { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Container,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Grid,
  Avatar,
  TextField,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBack, 
  Person, 
  Search,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  CheckCircle
} from '@mui/icons-material';
import '../styles/adminuser.css';

function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchApprovedUsers() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/kyc/requests?status=approved");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      }
      setLoading(false);
    }
    fetchApprovedUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobileNumber?.includes(searchTerm)
  );

  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  return (
    <div className="admin-users-page">
      <Container maxWidth="xl" className="page-container">
        {/* Header Section */}
        <Card className="page-header">
          <CardContent className="header-content">
            <Box className="header-main">
              <Box className="header-left">
                <Tooltip title="Back to Dashboard">
                  <IconButton
                    onClick={() => navigate('/admin')}
                    className="back-button"
                  >
                    <ArrowBack />
                  </IconButton>
                </Tooltip>
                <Box className="title-section">
                  <Person className="header-icon" />
                  <Box>
                    <Typography variant="h4" className="page-title">
                      Approved Users
                    </Typography>
                    <Typography variant="body1" className="page-subtitle">
                      Manage and view all approved user accounts
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Chip 
                icon={<CheckCircle />}
                label={`${users.length} Approved Users`}
                color="success"
                variant="filled"
                className="count-chip"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <Grid container spacing={3} className="stats-grid">
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Typography variant="h3" className="stat-number">
                  {users.length}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Total Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Typography variant="h3" className="stat-number">
                  {users.filter(u => u.mobileNumber).length}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  With Mobile
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Typography variant="h3" className="stat-number">
                  {new Set(users.map(u => u.city)).size}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Cities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card">
              <CardContent>
                <Typography variant="h3" className="stat-number">
                  {new Set(users.map(u => u.state)).size}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  States
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Card className="search-section">
          <CardContent>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="search-icon" />
                  </InputAdornment>
                ),
              }}
              className="search-field"
            />
          </CardContent>
        </Card>

        {/* Users Table */}
        {loading ? (
          <Box className="loading-container">
            <CircularProgress size={60} thickness={4} className="loading-spinner" />
            <Typography variant="h6" className="loading-text">
              Loading approved users...
            </Typography>
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Card className="empty-state">
            <CardContent className="empty-content">
              <Person className="empty-icon" />
              <Typography variant="h5" className="empty-title">
                {searchTerm ? "No users found" : "No approved users"}
              </Typography>
              <Typography variant="body2" className="empty-subtitle">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "All approved users will appear here"
                }
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card className="table-card">
            <CardContent className="table-card-content">
              <Box className="table-header">
                <Typography variant="h6" className="table-title">
                  User Details
                </Typography>
                <Chip 
                  label={`${filteredUsers.length} users`}
                  size="small"
                  variant="outlined"
                />
              </Box>
              
              <TableContainer className="table-container">
                <Table className="users-table">
                  <TableHead className="table-head">
                    <TableRow className="table-head-row">
                      <TableCell className="table-cell header-cell">User</TableCell>
                      <TableCell className="table-cell header-cell">Contact</TableCell>
                      <TableCell className="table-cell header-cell">Address</TableCell>
                      <TableCell className="table-cell header-cell">Approval Date</TableCell>
                      <TableCell className="table-cell header-cell">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="table-body">
                    {filteredUsers.map((user, index) => (
                      <TableRow 
                        key={user._id}
                        className="table-row"
                      >
                        <TableCell className="table-cell">
                          <Box className="user-info">
                            <Avatar className="user-avatar">
                              {getInitials(user.firstName, user.lastName)}
                            </Avatar>
                            <Box className="user-details">
                              <Typography variant="subtitle2" className="user-name">
                                {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A"}
                              </Typography>
                              <Typography variant="caption" className="user-id">
                                ID: {user._id?.slice(-8) || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className="table-cell">
                          <Box className="contact-info">
                            <Box className="contact-item">
                              <Email className="contact-icon" />
                              <Typography variant="body2" className="contact-text">
                                {user.email || "N/A"}
                              </Typography>
                            </Box>
                            <Box className="contact-item">
                              <Phone className="contact-icon" />
                              <Typography variant="body2" className="contact-text">
                                {user.mobileNumber || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className="table-cell">
                          <Box className="address-info">
                            <LocationOn className="address-icon" />
                            <Box className="address-details">
                              <Typography variant="body2" className="address-main">
                                {user.houseName || "N/A"}
                                {user.landmark && `, ${user.landmark}`}
                              </Typography>
                              <Typography variant="caption" className="address-secondary">
                                {[user.city, user.state, user.pinCode].filter(Boolean).join(", ") || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className="table-cell">
                          <Box className="date-info">
                            <CalendarToday className="date-icon" />
                            <Typography variant="body2" className="date-text">
                              {new Date(user.updatedAt || user.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="caption" className="time-text">
                            {new Date(user.updatedAt || user.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell className="table-cell">
                          <Chip
                            icon={<CheckCircle />}
                            label="Approved"
                            color="success"
                            size="small"
                            variant="filled"
                            className="status-chip"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  );
}

export default AdminUserList;