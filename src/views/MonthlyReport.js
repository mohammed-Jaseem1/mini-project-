import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Container
} from "@mui/material";
import { ArrowBack, Download, Analytics, TrendingUp, Warning, ShowChart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Styled card for metrics
const MetricCard = ({ title, value, subtitle, icon, color = "#1976d2" }) => (
  <Card
    sx={{
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      borderRadius: 3,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      border: `1px solid ${color}20`,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: `0 8px 25px ${color}30`
      },
      height: "100%"
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: 2,
            p: 1,
            mr: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ color: "#374151", fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ color: color, fontWeight: "bold", mb: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: "#6B7280" }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Enhanced income card
const IncomeCard = ({ value }) => (
  <Card
    sx={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      borderRadius: 3,
      boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 100%)"
      }
    }}
  >
    <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <TrendingUp sx={{ fontSize: 32, mr: 2, opacity: 0.9 }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Total Income
        </Typography>
      </Box>
      <Typography variant="h2" sx={{ fontWeight: "bold", textAlign: "center" }}>
        ₹{value}
      </Typography>
      <Chip 
        label="Monthly Revenue" 
        sx={{ 
          mt: 2, 
          backgroundColor: "rgba(255,255,255,0.2)", 
          color: "white",
          fontWeight: 500
        }} 
      />
    </CardContent>
  </Card>
);

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function MonthlyReport() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/report/monthly-report", {
        params: { month, year },
        withCredentials: true
      });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch report");
      setReport(null);
    }
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    
    // Add styling to PDF
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Monthly Gas Analytics Report", 20, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Report Period: ${months[report.month - 1]} ${report.year}`, 20, 55);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 65);
    
    // Add metrics in a table format
    const metrics = [
      ["Total Readings", report.totalReadings],
      ["Average Gas Level", `${report.avgGasLevel} ppm`],
      ["Highest Gas Level", `${report.maxGasLevel} ppm`],
      ["Lowest Gas Level", `${report.minGasLevel} ppm`],
      ["Alert Count (>700 ppm)", report.alertCount],
      ["Total Income", `₹${report.totalIncome}`]
    ];
    
    let yPosition = 85;
    metrics.forEach(([label, value], index) => {
      doc.setFillColor(index % 2 === 0 ? 240 : 255);
      doc.rect(20, yPosition - 5, 170, 10, 'F');
      doc.text(label, 25, yPosition);
      doc.text(value.toString(), 150, yPosition);
      yPosition += 12;
    });
    
    doc.save(`Gas_Report_${months[report.month - 1]}_${report.year}.pdf`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header Section */}
      <Card 
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          mb: 4,
          overflow: "hidden"
        }}
      >
        <CardContent sx={{ p: 4, color: "white", position: "relative" }}>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBack />}
            sx={{
              color: "white",
              mb: 3,
              border: "1px solid rgba(255,255,255,0.3)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)"
              }
            }}
            variant="outlined"
          >
            Back
          </Button>
          
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Analytics sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Monthly Analytics Report
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Comprehensive overview of gas monitoring data and revenue analytics
          </Typography>
        </CardContent>
      </Card>

      {/* Controls Section */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)"
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, color: "#374151", fontWeight: 600 }}>
          Select Reporting Period
        </Typography>
        
        <Grid container spacing={3} alignItems="end">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={month}
                label="Month"
                onChange={e => setMonth(Number(e.target.value))}
                sx={{ 
                  backgroundColor: "white",
                  borderRadius: 2
                }}
              >
                {months.map((m, idx) => (
                  <MenuItem key={m} value={idx + 1}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                label="Year"
                onChange={e => setYear(Number(e.target.value))}
                sx={{ 
                  backgroundColor: "white",
                  borderRadius: 2
                }}
              >
                {[...Array(6)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <MenuItem key={y} value={y}>{y}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              onClick={handleFetchReport}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Analytics />}
              sx={{
                background: "linear-gradient(90deg, #1976d2 0%, #009688 100%)",
                color: "#fff",
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                width: "100%",
                "&:hover": {
                  background: "linear-gradient(90deg, #1565c0 0%, #00796b 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(25, 118, 210, 0.3)"
                },
                "&:disabled": {
                  background: "#9e9e9e"
                }
              }}
            >
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            "& .MuiAlert-message": {
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Report Display Section */}
      {report && (
        <Box>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Readings"
                value={report.totalReadings}
                subtitle="Monthly data points"
                icon={<ShowChart sx={{ color: "#1976d2" }} />}
                color="#1976d2"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Avg Gas Level"
                value={`${report.avgGasLevel} ppm`}
                subtitle="Monthly average"
                icon={<Analytics sx={{ color: "#4CAF50" }} />}
                color="#4CAF50"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Alerts"
                value={report.alertCount}
                subtitle=">700 ppm threshold"
                icon={<Warning sx={{ color: "#FF9800" }} />}
                color="#FF9800"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Peak Level"
                value={`${report.maxGasLevel} ppm`}
                subtitle="Highest recorded"
                icon={<TrendingUp sx={{ color: "#F44336" }} />}
                color="#F44336"
              />
            </Grid>
          </Grid>

          {/* Detailed Report & Income */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  background: "white"
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, color: "#374151", fontWeight: 600 }}>
                  Detailed Analytics - {months[report.month - 1]} {report.year}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Lowest Gas Level
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {report.minGasLevel} ppm
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Data Coverage
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {Math.round((report.totalReadings / 30) * 100)}% daily avg
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownloadPDF}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    mt: 2,
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)"
                    }
                  }}
                >
                  Download Full Report (PDF)
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <IncomeCard value={report.totalIncome} />
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default MonthlyReport;