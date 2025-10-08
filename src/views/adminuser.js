import React, { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Container,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Person } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Add styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 24px 0 ' + alpha(theme.palette.primary.main, 0.1),
  overflow: 'hidden',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '0.875rem',
  padding: theme.spacing(2),
  '&.MuiTableCell-head': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    color: theme.palette.text.secondary,
    fontWeight: 600,
    letterSpacing: '0.03em',
  },
}));

function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchApprovedUsers() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/kyc/requests?status=approved");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setUsers([]);
      }
      setLoading(false);
    }
    fetchApprovedUsers();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        gap: 2,
      }}>
        <Tooltip title="Back to Dashboard">
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: alpha('#1976d2', 0.08),
              },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
        }}>
          <Person sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Approved Users
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No approved users found.
          </Typography>
        </Paper>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>#</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Mobile</StyledTableCell>
                <StyledTableCell>Address</StyledTableCell>
                <StyledTableCell>Approved At</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u, idx) => (
                <TableRow 
                  key={u._id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: alpha('#000', 0.02),
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <StyledTableCell>{idx + 1}</StyledTableCell>
                  <StyledTableCell sx={{ fontWeight: 500 }}>
                    {`${u.firstName || ""} ${u.lastName || ""}`.trim()}
                  </StyledTableCell>
                  <StyledTableCell sx={{ color: 'text.secondary' }}>
                    {u.email}
                  </StyledTableCell>
                  <StyledTableCell>{u.mobileNumber}</StyledTableCell>
                  <StyledTableCell sx={{ 
                    maxWidth: 250,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {`${u.houseName || ""}, ${u.landmark || ""}, ${u.city || ""}, ${u.state || ""}, ${u.pinCode || ""}`}
                  </StyledTableCell>
                  <StyledTableCell sx={{ color: 'text.secondary' }}>
                    {new Date(u.updatedAt || u.createdAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
    </Container>
  );
}

export default AdminUserList;

