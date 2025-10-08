import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Box,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack,
  Assessment,
  PendingActions,
  CheckCircle,
  Report
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'linear-gradient(145deg, #1a1a2e 0%, #162447 100%)',
  minHeight: '100vh',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: alpha('#162447', 0.9),
  borderRadius: 16,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
  overflow: 'hidden',
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#e0e0e0',
  borderBottom: '1px solid #334b6b',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1f2937 0%, #162447 100%)',
  color: '#e0e0e0',
  height: '100%',
  borderRadius: 16,
  transition: 'all 0.3s ease-in-out',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  '& .MuiChip-label': {
    padding: '0 12px',
  },
}));

function AdminFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    complaints: 0
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/feedback/all', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
        
        // Calculate statistics
        const statsCount = data.reduce((acc, feedback) => ({
          total: acc.total + 1,
          pending: acc.pending + (feedback.reviewStatus === 'pending' ? 1 : 0),
          reviewed: acc.reviewed + (feedback.reviewStatus === 'reviewed' ? 1 : 0),
          complaints: acc.complaints + (feedback.type === 'complaint' ? 1 : 0)
        }), { total: 0, pending: 0, reviewed: 0, complaints: 0 });
        
        setStats(statsCount);
      }
    } catch (err) {
      setError('Failed to fetch feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedback/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewStatus: status })
      });
      
      if (response.ok) {
        fetchFeedbacks(); // Refresh the list
      }
    } catch (err) {
      setError('Failed to update feedback status');
    }
  };

  if (loading) return <CircularProgress />;

  const StatCard = ({ title, value, icon, color }) => (
    <StyledCard>
      <CardContent sx={{ 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}>
        {icon}
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: alpha('#fff', 0.7)
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${color} 30%, ${alpha(color, 0.7)} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </StyledCard>
  );

  return (
    <StyledContainer maxWidth="lg">
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        background: alpha('#1a237e', 0.15),
        padding: 3,
        borderRadius: 2,
        backdropFilter: 'blur(8px)'
      }}>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{
            mr: 2,
            backgroundColor: '#1a237e',
            '&:hover': {
              backgroundColor: '#283593',
            },
          }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ color: '#e0e0e0', fontWeight: 'bold' }}>
          Feedback Management
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Total Feedback"
            value={stats.total}
            icon={<Assessment sx={{ fontSize: 40, color: '#64b5f6' }} />}
            color="#64b5f6"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Pending"
            value={stats.pending}
            icon={<PendingActions sx={{ fontSize: 40, color: '#ff9800' }} />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Reviewed"
            value={stats.reviewed}
            icon={<CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Complaints"
            value={stats.complaints}
            icon={<Report sx={{ fontSize: 40, color: '#f44336' }} />}
            color="#f44336"
          />
        </Grid>
      </Grid>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 1,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            },
          }}
        >
          {error}
        </Alert>
      )}

      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: alpha('#fff', 0.7)
              }}>
                Date
              </StyledTableCell>
              <StyledTableCell sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: alpha('#fff', 0.7)
              }}>
                Type
              </StyledTableCell>
              <StyledTableCell sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: alpha('#fff', 0.7)
              }}>
                Subject
              </StyledTableCell>
              <StyledTableCell sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: alpha('#fff', 0.7)
              }}>
                Email
              </StyledTableCell>
              <StyledTableCell sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: alpha('#fff', 0.7)
              }}>
                Priority
              </StyledTableCell>
              <StyledTableCell sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: alpha('#fff', 0.7)
              }}>
                Status
              </StyledTableCell>
              <StyledTableCell sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: alpha('#fff', 0.7)
              }}>
                Actions
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.map((feedback) => (
              <TableRow 
                key={feedback._id}
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.05),
                    transform: 'scale(1.005)',
                  },
                }}
              >
                <StyledTableCell>
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </StyledTableCell>
                <StyledTableCell>
                  <StyledChip
                    label={feedback.type}
                    color={feedback.type === 'complaint' ? 'error' : 'primary'}
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell>{feedback.subject}</StyledTableCell>
                <StyledTableCell>{feedback.email}</StyledTableCell>
                <StyledTableCell>
                  <Chip 
                    label={feedback.priority}
                    color={
                      feedback.priority === 'high' ? 'error' :
                      feedback.priority === 'medium' ? 'warning' : 'success'
                    }
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <Chip
                    label={feedback.reviewStatus}
                    color={feedback.reviewStatus === 'reviewed' ? 'success' : 'warning'}
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell>
                  {feedback.reviewStatus === 'pending' && (
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      onClick={() => handleReview(feedback._id, 'reviewed')}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
                        boxShadow: '0 3px 12px 0 rgba(76,175,80,0.3)',
                        '&:hover': {
                          boxShadow: '0 5px 15px 0 rgba(76,175,80,0.4)',
                        }
                      }}
                    >
                      Mark Reviewed
                    </Button>
                  )}
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </StyledContainer>
  );
}

export default AdminFeedback;
