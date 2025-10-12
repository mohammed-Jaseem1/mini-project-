import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack,
  Assessment,
  PendingActions,
  CheckCircle,
  Report,
  Email,
  Schedule,
  Flag,
  Visibility,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminFeedback.css';

function AdminFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Move fetchFeedbacks outside useEffect so it's defined in the component scope
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/feedback/all", {
        credentials: "include"
      });
      const data = await res.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch feedbacks");
      setFeedbacks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleReview = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedback/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewStatus: status })
      });
      
      if (response.ok) {
        fetchFeedbacks();
        setViewModalOpen(false);
      } else {
        throw new Error('Failed to update feedback');
      }
    } catch (err) {
      setError('Failed to update feedback status');
    }
  };

  const handleViewFullMessage = (feedback) => {
    setSelectedFeedback(feedback);
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedFeedback(null);
  };

  // Calculate statistics safely
  const stats = {
    total: Array.isArray(feedbacks) ? feedbacks.length : 0,
    pending: Array.isArray(feedbacks) ? feedbacks.filter(f => f.reviewStatus === 'pending').length : 0,
    reviewed: Array.isArray(feedbacks) ? feedbacks.filter(f => f.reviewStatus === 'reviewed').length : 0,
    complaints: Array.isArray(feedbacks) ? feedbacks.filter(f => f.type === 'complaint').length : 0
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={50} className="loading-spinner" />
        <Typography variant="h6">Loading feedback...</Typography>
      </Box>
    );
  }

  return (
    <div className="admin-feedback-page">
      <Container maxWidth="xl" className="page-container">
        {/* Header */}
        <Card className="page-header">
          <CardContent className="header-content">
            <Box className="header-main">
              <Box className="header-left">
                <IconButton onClick={() => navigate(-1)} className="back-button">
                  <ArrowBack />
                </IconButton>
                <Box className="title-section">
                  <Assessment className="header-icon" />
                  <Box>
                    <Typography variant="h4" className="page-title">
                      Feedback Management
                    </Typography>
                    <Typography variant="body1" className="page-subtitle">
                      Manage user feedback and complaints
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <Grid container spacing={3} className="stats-grid">
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card total-card">
              <CardContent>
                <Assessment className="stat-icon" />
                <Typography variant="h3" className="stat-number">
                  {stats.total}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Total Feedback
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card pending-card">
              <CardContent>
                <PendingActions className="stat-icon" />
                <Typography variant="h3" className="stat-number">
                  {stats.pending}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Pending Review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card reviewed-card">
              <CardContent>
                <CheckCircle className="stat-icon" />
                <Typography variant="h3" className="stat-number">
                  {stats.reviewed}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Reviewed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card complaints-card">
              <CardContent>
                <Report className="stat-icon" />
                <Typography variant="h3" className="stat-number">
                  {stats.complaints}
                </Typography>
                <Typography variant="body2" className="stat-label">
                  Complaints
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" className="error-alert">
            {error}
          </Alert>
        )}

        {/* Feedback Cards */}
        <Grid container spacing={3} className="feedback-grid">
          {!Array.isArray(feedbacks) || feedbacks.length === 0 ? (
            <Grid item xs={12}>
              <Card className="empty-card">
                <Box className="empty-state">
                  <Assessment className="empty-icon" />
                  <Typography variant="h6">No feedback found</Typography>
                  <Typography variant="body2">
                    {error ? 'Error loading feedback' : 'No feedback submissions available'}
                  </Typography>
                  {error && (
                    <Button 
                      variant="contained" 
                      onClick={fetchFeedbacks}
                      className="retry-button"
                    >
                      Try Again
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ) : (
            feedbacks.map((feedback) => (
              <Grid item xs={12} md={6} lg={4} key={feedback._id || Math.random()}>
                <Card className={`feedback-card ${feedback.reviewStatus || 'pending'}`}>
                  <CardContent className="feedback-content">
                    {/* Header */}
                    <Box className="feedback-header">
                      <Box className="feedback-type">
                        <Box className={`type-badge ${feedback.type || 'feedback'}`}>
                          {feedback.type === 'complaint' ? <Flag /> : <Assessment />}
                          <Typography variant="caption" className="type-text">
                            {feedback.type || 'feedback'}
                          </Typography>
                        </Box>
                        <Box className={`status-badge ${feedback.reviewStatus || 'pending'}`}>
                          {feedback.reviewStatus || 'pending'}
                        </Box>
                      </Box>
                      <Typography variant="caption" className="feedback-date">
                        <Schedule className="date-icon" />
                        {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'Unknown date'}
                      </Typography>
                    </Box>

                    {/* Subject */}
                    <Typography variant="h6" className="feedback-subject">
                      {feedback.subject || 'No subject'}
                    </Typography>

                    {/* Description Preview */}
                    {feedback.description && (
                      <Box className="description-preview-section">
                        <Typography variant="subtitle2" className="description-label">
                          Description:
                        </Typography>
                        <Typography variant="body2" className="feedback-description">
                          {feedback.description.length > 100
                            ? `${feedback.description.substring(0, 100)}...`
                            : feedback.description}
                        </Typography>
                        {feedback.description.length > 100 && (
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewFullMessage(feedback)}
                            className="view-full-button"
                          >
                            View Full
                          </Button>
                        )}
                      </Box>
                    )}
                    {/* Message Preview with View Button */}
                    <Box className="message-preview-section">
                      <Typography variant="body2" className="feedback-message">
                        {feedback.message ? 
                          (feedback.message.length > 100 
                            ? `${feedback.message.substring(0, 100)}...` 
                            : feedback.message
                          ) : 'No message content'
                        }
                      </Typography>
                      {feedback.message && feedback.message.length > 100 && (
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewFullMessage(feedback)}
                          className="view-full-button"
                        >
                          View Full
                        </Button>
                      )}
                    </Box>

                    {/* Footer */}
                    <Box className="feedback-footer">
                      <Box className="user-info">
                        <Email className="email-icon" />
                        <Typography variant="body2" className="user-email">
                          {feedback.email || 'No email'}
                        </Typography>
                      </Box>
                      <Box className="priority-badge">
                        <Typography variant="caption" className={`priority ${feedback.priority || 'medium'}`}>
                          {feedback.priority || 'medium'} priority
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    {(feedback.reviewStatus === 'pending' || !feedback.reviewStatus) && (
                      <Box className="action-buttons">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleReview(feedback._id, 'reviewed')}
                          className="review-button"
                          startIcon={<CheckCircle />}
                        >
                          Mark Reviewed
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* View Full Message Modal */}
        <Dialog 
          open={viewModalOpen} 
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          className="message-modal"
        >
          <DialogTitle className="modal-title">
            <Box className="modal-header">
              <Typography variant="h5" className="modal-title-text">
                {selectedFeedback?.subject || 'Feedback Details'}
              </Typography>
              <IconButton onClick={handleCloseModal} className="close-button">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent className="modal-content">
            {selectedFeedback && (
              <Box className="feedback-details">
                {/* Basic Info */}
                <Grid container spacing={2} className="details-grid">
                  <Grid item xs={12} sm={6}>
                    <Box className="detail-item">
                      <Typography variant="subtitle2" className="detail-label">
                        Type:
                      </Typography>
                      <Box className={`type-badge ${selectedFeedback.type || 'feedback'}`}>
                        {selectedFeedback.type === 'complaint' ? <Flag /> : <Assessment />}
                        <Typography variant="body2" className="type-text">
                          {selectedFeedback.type || 'feedback'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box className="detail-item">
                      <Typography variant="subtitle2" className="detail-label">
                        Status:
                      </Typography>
                      <Box className={`status-badge ${selectedFeedback.reviewStatus || 'pending'}`}>
                        {selectedFeedback.reviewStatus || 'pending'}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box className="detail-item">
                      <Typography variant="subtitle2" className="detail-label">
                        Priority:
                      </Typography>
                      <Typography variant="caption" className={`priority ${selectedFeedback.priority || 'medium'}`}>
                        {selectedFeedback.priority || 'medium'} priority
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box className="detail-item">
                      <Typography variant="subtitle2" className="detail-label">
                        Submitted:
                      </Typography>
                      <Typography variant="body2" className="detail-value">
                        {selectedFeedback.createdAt ? 
                          new Date(selectedFeedback.createdAt).toLocaleString() : 
                          'Unknown date'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box className="detail-item">
                      <Typography variant="subtitle2" className="detail-label">
                        Email:
                      </Typography>
                      <Typography variant="body2" className="detail-value">
                        {selectedFeedback.email || 'No email provided'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Description (if present) */}
                {selectedFeedback.description && (
                  <Box className="full-description-section">
                    <Typography variant="subtitle2" className="description-label">
                      Description:
                    </Typography>
                    <Box className="description-content">
                      <Typography variant="body1" className="full-description">
                        {selectedFeedback.description}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {/* Full Message */}
                <Box className="full-message-section">
                  <Typography variant="subtitle2" className="message-label">
                    Message:
                  </Typography>
                  <Box className="message-content">
                    <Typography variant="body1" className="full-message">
                      {selectedFeedback.message || 'No message content'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions className="modal-actions">
            <Button onClick={handleCloseModal} className="close-modal-button">
              Close
            </Button>
            {selectedFeedback && (selectedFeedback.reviewStatus === 'pending' || !selectedFeedback.reviewStatus) && (
              <Button
                variant="contained"
                onClick={() => handleReview(selectedFeedback._id, 'reviewed')}
                className="review-modal-button"
                startIcon={<CheckCircle />}
              >
                Mark as Reviewed
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
}

export default AdminFeedback;