import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Paper,
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
    IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    head: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}));

const PaymentHistory = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/payment');
                console.log('Payment data received:', response.data);
                // Transform the data to match the table structure
                const formattedPayments = response.data.map(payment => ({
                    id: payment._id,
                    gmail: payment.gmail,
                    date: payment.date,
                    amount: payment.amountPaid, // Changed from amount to amountPaid
                    status: payment.approved ? 'Completed' : 'Pending',
                    method: payment.paymentMethod // Changed from method to paymentMethod
                }));
                setPayments(formattedPayments);
                setError(null);
            } catch (err) {
                console.error('Error details:', err);
                setError('Failed to fetch payment history: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" m={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton 
                    onClick={() => navigate(-1)}
                    sx={{ mr: 2, color: '#666' }}
                >
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5" component="h2">
                    Payment History
                </Typography>
            </Box>
            <Paper elevation={3} sx={{ p: 3 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="payment history table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>#</StyledTableCell>
                                <StyledTableCell>Email</StyledTableCell>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell>Amount</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Payment Method</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No payments found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment, index) => (
                                    <TableRow key={payment.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{payment.gmail}</TableCell>
                                        <TableCell>
                                            {new Date(payment.date).toLocaleString('en-IN')}
                                        </TableCell>
                                        <TableCell sx={{ color: 'success.main', fontWeight: 'medium' }}>
                                            ₹{payment.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={payment.status}
                                                color={payment.status === 'Completed' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{payment.method}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default PaymentHistory;

