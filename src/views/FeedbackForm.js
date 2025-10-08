import React, { useState } from "react";

import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Alert,
  FormControl,
  InputLabel,
  styled,
  Box
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4),
  backgroundColor: '#162447',
  color: '#e0e0e0',
}));

const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

function FeedbackForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "feedback",
    subject: "",
    description: "",
    priority: "medium",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    
    try {
      const response = await axios.post(
        "http://localhost:5000/api/feedback",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 201) {
        setSuccess(true);
        setFormData({
          type: "feedback",
          subject: "",
          description: "",
          priority: "medium",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting feedback");
    }
  };

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              mr: 2,
              color: '#e0e0e0',
              '&:hover': {
                backgroundColor: 'rgba(224, 224, 224, 0.1)'
              }
            }}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4" gutterBottom sx={{ color: '#e0e0e0', mb: 0 }}>
            Submit Feedback
          </Typography>
        </Box>

        <StyledForm onSubmit={handleSubmit}>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Feedback submitted successfully!
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel sx={{ color: '#e0e0e0' }}>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              sx={{
                color: '#e0e0e0',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#334b6b',
                },
              }}
            >
              <MenuItem value="feedback">Feedback</MenuItem>
              <MenuItem value="bug">complaint</MenuItem>
              <MenuItem value="feature">Request</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
                '& fieldset': {
                  borderColor: '#334b6b',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#e0e0e0',
              },
            }}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            fullWidth
            multiline
            rows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
                '& fieldset': {
                  borderColor: '#334b6b',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#e0e0e0',
              },
            }}
          />

          <FormControl fullWidth>
            <InputLabel sx={{ color: '#e0e0e0' }}>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              sx={{
                color: '#e0e0e0',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#334b6b',
                },
              }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            size="large"
            endIcon={<SendIcon />}
            sx={{
              mt: 2,
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#283593',
              },
            }}
          >
            Submit Feedback
          </Button>
        </StyledForm>
      </StyledPaper>
    </Container>
  );
}

export default FeedbackForm;
