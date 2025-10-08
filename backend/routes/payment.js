const express = require('express');
const router = express.Router();
const Payment1 = require('../models/Payment');

// Save payment with all details
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      amountPaid,
      paymentMethod,
      cardLast4Digits,
      expiry,
      cvv,
      billingAddress,
      gmail
    } = req.body;

    if (!customerId || !amountPaid || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newPayment = new Payment1({
      customerId,
      amountPaid,
      paymentMethod,
      cardLast4Digits: cardLast4Digits || null,
      expiry: expiry || null,
      cvv: cvv || null,
      billingAddress: billingAddress || {},
      gmail: gmail || null,
      approved: false
    });

    await newPayment.save();
    res.status(201).json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Payment Save Error:', error);
    res.status(500).json({ message: 'Server error while saving payment' });
  }
});

// Update the GET route to include all necessary fields
router.get('/', async (req, res) => {
  try {
    const payments = await Payment1.find()
      .select('customerId amountPaid paymentMethod date approved gmail')
      .sort({ date: -1 });
    res.json(payments.map(payment => ({
      id: payment._id,
      date: payment.date,
      amount: payment.amountPaid,
      status: payment.approved ? 'Completed' : 'Pending',
      method: payment.paymentMethod,
      gmail: payment.gmail
    })));
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error while fetching payments' });
  }
});

// Route for admin to approve payment (example)
router.post('/approve', async (req, res) => {
  try {
    const { gmail } = req.body;
    const payment = await Payment1.findOne({ gmail });
    if (payment) {
      payment.approved = true;
      await payment.save();
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: "Payment not found" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route for user to check approval status
router.get('/check', async (req, res) => {
  try {
    const gmail = (req.query.gmail || '').toLowerCase().trim();
    if (!gmail) return res.status(400).json({ approved: false, message: 'No gmail provided' });

    const payment = await Payment1.findOne({ gmail });
    if (payment && payment.approved) {
      return res.json({ approved: true });
    } else {
      return res.json({ approved: false });
    }
  } catch (error) {
    res.status(500).json({ approved: false, message: 'Server error' });
  }
});

// Route for user to get all payments for a specific email
router.get('/user/:email', async (req, res) => {
  try {
    const payments = await Payment1.findByUserGmail(req.params.email);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get payments for specific user
router.get('/getUserPayments/:email', async (req, res) => {
  try {
    const payments = await Payment1.find({ gmail: req.params.email })
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
