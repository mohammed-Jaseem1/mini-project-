import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Typography, Container, Button, Box, 
  Chip, IconButton, Tooltip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Card,
  CardContent,
  Grid,
  Avatar,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon, 
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Search,
  Person,
  Email,
  Schedule,
  FilterList
} from '@mui/icons-material';
import { CheckCircle, Cancel } from '@mui/icons-material'; // Add these imports
import { useNavigate } from 'react-router-dom';
import '../styles/connection.css';

function ConnectionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: null, name: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/kyc/requests");
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setRequests([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/kyc/requests/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Action failed');
      
      setRequests(prev =>
        prev.map(req => req._id === id ? { ...req, status: action } : req)
      );
      setConfirmDialog({ open: false, id: null, action: null, name: null });
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      approved: { color: 'success', label: 'Approved', icon: <CheckCircle /> },
      rejected: { color: 'error', label: 'Rejected', icon: <Cancel /> },
      pending: { color: 'warning', label: 'Pending Review', icon: <Schedule /> }
    }[status] || { color: 'default', label: status, icon: null };

    return (
      <Chip
        icon={statusConfig.icon}
        label={statusConfig.label}
        color={statusConfig.color}
        size="small"
        variant="filled"
        className="status-chip"
      />
    );
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  // Filter requests based on search and status
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const approvedCount = requests.filter(req => req.status === 'approved').length;
  const rejectedCount = requests.filter(req => req.status === 'rejected').length;

  return (
    <div className="connection-requests-page">
      <Container maxWidth="xl" className="page-container">
        {/* Header Section */}
        <Card className="page-header">
          <CardContent className="header-content">
            <Box className="header-main">
              <Box className="header-left">
                <Tooltip title="Back to Dashboard">
                  <IconButton
                    onClick={() => navigate('/admin')} // Change to navigate to admindash
                    className="back-button"
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Box className="title-section">
                  <Person className="header-icon" />
                  <Box>
                    <Typography variant="h4" className="page-title">
                      Connection Requests
                    </Typography>
                    <Typography variant="body1" className="page-subtitle">
                      Review and manage gas connection applications
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={fetchRequests}
                variant="contained"
                className="refresh-button"
              >
                Refresh
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <Grid container spacing={3} className="stats-grid">
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card total-card">
              <CardContent>
                <Typography variant="h3" className="stat-number">
                  {requests.length}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Total Requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card pending-card">
              <CardContent>
                <Typography variant="h3" className="stat-number">
                  {pendingCount}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Pending Review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card approved-card">
              <CardContent>
                <Typography variant="h3" className="stat-number">
                  {approvedCount}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card rejected-card">
              <CardContent>
                <Typography variant="h3" className="stat-number">
                  {rejectedCount}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Rejected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Card className="filters-section">
          <CardContent className="filters-content">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by name or email..."
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
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status Filter"
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterList className="filter-icon" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" className="results-count">
                  Showing {filteredRequests.length} of {requests.length} requests
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            className="error-alert"
            action={
              <Button color="inherit" size="small" onClick={fetchRequests}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box className="loading-container">
            <CircularProgress size={60} thickness={4} className="loading-spinner" />
            <Typography variant="h6" className="loading-text">
              Loading connection requests...
            </Typography>
          </Box>
        ) : (
          /* Requests Table */
          <Card className="table-card">
            <CardContent className="table-card-content">
              <Box className="table-header">
                <Typography variant="h6" className="table-title">
                  Connection Requests
                </Typography>
                <Chip 
                  label={`${filteredRequests.length} requests`}
                  size="small"
                  variant="outlined"
                />
              </Box>
              
              <TableContainer className="table-container">
                <Table className="requests-table">
                  <TableHead className="table-head">
                    <TableRow className="table-head-row">
                      <TableCell className="table-cell header-cell">Applicant</TableCell>
                      <TableCell className="table-cell header-cell">Contact</TableCell>
                      <TableCell className="table-cell header-cell">Request Date</TableCell>
                      <TableCell className="table-cell header-cell">Status</TableCell>
                      <TableCell className="table-cell header-cell" align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="table-body">
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="empty-cell">
                          <Box className="empty-state">
                            <Person className="empty-icon" />
                            <Typography variant="h6" className="empty-title">
                              No requests found
                            </Typography>
                            <Typography variant="body2" className="empty-subtitle">
                              {searchTerm || statusFilter !== "all" 
                                ? "Try adjusting your search or filters" 
                                : "No connection requests available"
                              }
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request, index) => (
                        <TableRow 
                          key={request._id}
                          className={`table-row ${request.status}`}
                        >
                          <TableCell className="table-cell">
                            <Box className="applicant-info">
                              <Avatar className="applicant-avatar">
                                {getInitials(request.firstName, request.lastName)}
                              </Avatar>
                              <Box className="applicant-details">
                                <Typography variant="subtitle2" className="applicant-name">
                                  {`${request.firstName || ""} ${request.lastName || ""}`.trim() || "N/A"}
                                </Typography>
                                <Typography variant="caption" className="applicant-id">
                                  ID: {request._id?.slice(-8) || "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell className="table-cell">
                            <Box className="contact-info">
                              <Box className="contact-item">
                                <Email className="contact-icon" />
                                <Typography variant="body2" className="contact-text">
                                  {request.email || "N/A"}
                                </Typography>
                              </Box>
                              {request.mobileNumber && (
                                <Typography variant="caption" className="contact-mobile">
                                  {request.mobileNumber}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell className="table-cell">
                            <Box className="date-info">
                              <Typography variant="body2" className="date-text">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" className="time-text">
                                {new Date(request.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell className="table-cell">
                            {getStatusChip(request.status)}
                          </TableCell>
                          <TableCell className="table-cell" align="center">
                            {request.status === "pending" ? (
                              <Box className="action-buttons">
                                <Tooltip title="Approve Request">
                                  <IconButton 
                                    color="success"
                                    onClick={() => setConfirmDialog({ 
                                      open: true, 
                                      id: request._id, 
                                      action: 'approved',
                                      name: `${request.firstName} ${request.lastName}`.trim()
                                    })}
                                    className="approve-button"
                                  >
                                    <ApproveIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject Request">
                                  <IconButton 
                                    color="error"
                                    onClick={() => setConfirmDialog({ 
                                      open: true, 
                                      id: request._id, 
                                      action: 'rejected',
                                      name: `${request.firstName} ${request.lastName}`.trim()
                                    })}
                                    className="reject-button"
                                  >
                                    <RejectIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ) : (
                              <Typography variant="caption" className="action-completed">
                                Action Completed
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <Dialog 
          open={confirmDialog.open} 
          onClose={() => setConfirmDialog({ open: false })}
          className="confirmation-dialog"
        >
          <DialogTitle className="dialog-title">
            <Box className="dialog-title-content">
              {confirmDialog.action === 'approved' ? (
                <ApproveIcon className="dialog-icon approved" />
              ) : (
                <RejectIcon className="dialog-icon rejected" />
              )}
              Confirm {confirmDialog.action === 'approved' ? 'Approval' : 'Rejection'}
            </Box>
          </DialogTitle>
          <DialogContent className="dialog-content">
            <Typography variant="body1">
              Are you sure you want to <strong>{confirmDialog.action}</strong> the connection request from:
            </Typography>
            <Typography variant="h6" className="applicant-name-dialog">
              {confirmDialog.name}
            </Typography>
            <Typography variant="body2" className="dialog-warning">
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button 
              onClick={() => setConfirmDialog({ open: false })}
              variant="outlined"
              className="cancel-button"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleAction(confirmDialog.id, confirmDialog.action)}
              color={confirmDialog.action === 'approved' ? 'success' : 'error'}
              variant="contained"
              className="confirm-button"
              startIcon={confirmDialog.action === 'approved' ? <ApproveIcon /> : <RejectIcon />}
            >
              {confirmDialog.action === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
}

export default ConnectionRequests;