import React, { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Container, Button, Box, 
  Chip, IconButton, Tooltip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon, 
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function ConnectionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: null });
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/kyc/requests");
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data);
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
      setConfirmDialog({ open: false, id: null, action: null });
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusChip = (status) => {
    const statusProps = {
      approved: { color: 'success', label: 'Approved' },
      rejected: { color: 'error', label: 'Rejected' },
      pending: { color: 'warning', label: 'Pending' }
    }[status] || { color: 'default', label: status };

    return <Chip {...statusProps} size="small" />;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate(-1)} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Connection Requests</Typography>
        </Box>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={fetchRequests}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Requested At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req, idx) => (
              <TableRow key={req._id} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{`${req.firstName || ""} ${req.lastName || ""}`.trim()}</TableCell>
                <TableCell>{req.email}</TableCell>
                <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                <TableCell>{getStatusChip(req.status)}</TableCell>
                <TableCell align="center">
                  {req.status === "pending" && (
                    <Box>
                      <Tooltip title="Approve">
                        <IconButton 
                          color="success"
                          onClick={() => setConfirmDialog({ 
                            open: true, 
                            id: req._id, 
                            action: 'approved',
                            name: `${req.firstName} ${req.lastName}`.trim()
                          })}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton 
                          color="error"
                          onClick={() => setConfirmDialog({ 
                            open: true, 
                            id: req._id, 
                            action: 'rejected',
                            name: `${req.firstName} ${req.lastName}`.trim()
                          })}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false })}>
        <DialogTitle>
          Confirm {confirmDialog.action === 'approved' ? 'Approval' : 'Rejection'}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to {confirmDialog.action} the request from {confirmDialog.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>Cancel</Button>
          <Button 
            onClick={() => handleAction(confirmDialog.id, confirmDialog.action)}
            color={confirmDialog.action === 'approved' ? 'success' : 'error'}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ConnectionRequests;