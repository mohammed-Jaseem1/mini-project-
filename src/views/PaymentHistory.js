import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Container,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Box,
    IconButton,
    Card,
    CardContent
} from '@mui/material';
import { ArrowBack, Payment, Email, CalendarToday, AccountBalanceWallet } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/PaymentHistory.css';

const PaymentHistory = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/payment');
                const formattedPayments = response.data.map(payment => ({
                    id: payment._id,
                    gmail: payment.gmail,
                    date: payment.date,
                    amount: payment.amountPaid,
                    status: payment.approved ? 'Completed' : 'Pending',
                    method: payment.paymentMethod
                }));
                setPayments(formattedPayments);
                setError(null);
            } catch (err) {
                setError('Failed to fetch payment history: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    if (loading) {
        return (
            <Box className="loading-container">
                <CircularProgress size={50} className="loading-spinner" />
                <Typography variant="h6" className="loading-text">Loading payments...</Typography>
            </Box>
        );
    }

    return (
        <div className="payment-history-page">
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
                                    <Payment className="header-icon" />
                                    <Box>
                                        <Typography variant="h4" className="page-title">
                                            Payment History
                                        </Typography>
                                        <Typography variant="body1" className="page-subtitle">
                                            Track all payment transactions
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box className="header-stats">
                                <Box className="stat-item">
                                    <Typography variant="h6" className="stat-number">
                                        {payments.length}
                                    </Typography>
                                    <Typography variant="body2" className="stat-label">
                                        Total Payments
                                    </Typography>
                                </Box>
                                <Box className="stat-item">
                                    <Typography variant="h6" className="stat-number">
                                        ₹{totalRevenue.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" className="stat-label">
                                        Total Revenue
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {error && (
                    <Alert severity="error" className="error-alert">
                        {error}
                    </Alert>
                )}

                {/* Payment Table */}
                <Card className="table-card">
                    <CardContent className="table-content">
                        <TableContainer className="table-container">
                            <Table className="payment-table">
                                <TableHead className="table-head">
                                    <TableRow className="table-head-row">
                                        <TableCell className="table-header-cell">#</TableCell>
                                        <TableCell className="table-header-cell">
                                            <Email className="header-icon-small" /> Email
                                        </TableCell>
                                        <TableCell className="table-header-cell">
                                            <CalendarToday className="header-icon-small" /> Date
                                        </TableCell>
                                        <TableCell className="table-header-cell">
                                            <AccountBalanceWallet className="header-icon-small" /> Amount
                                        </TableCell>
                                        <TableCell className="table-header-cell">Status</TableCell>
                                        <TableCell className="table-header-cell">Method</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {payments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="empty-cell">
                                                <Box className="empty-state">
                                                    <Payment className="empty-icon" />
                                                    <Typography variant="h6">No payments found</Typography>
                                                    <Typography variant="body2">No payment records available</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        payments.map((payment, index) => (
                                            <TableRow key={payment.id} className="table-row">
                                                <TableCell className="table-cell index-cell">{index + 1}</TableCell>
                                                <TableCell className="table-cell email-cell">{payment.gmail}</TableCell>
                                                <TableCell className="table-cell">
                                                    {new Date(payment.date).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                    <Typography variant="caption" className="time-text">
                                                        {new Date(payment.date).toLocaleTimeString('en-IN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className="table-cell amount-cell">
                                                    ₹{payment.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="table-cell">
                                                    <Chip
                                                        label={payment.status}
                                                        color={payment.status === 'Completed' ? 'success' : 'warning'}
                                                        size="small"
                                                        className="status-chip"
                                                    />
                                                </TableCell>
                                                <TableCell className="table-cell method-cell">
                                                    {payment.method}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Container>
        </div>
    );
};

export default PaymentHistory;