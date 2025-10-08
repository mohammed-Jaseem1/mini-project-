const express = require('express');
const router = express.Router();
const Payment1 = require('../models/Payment');

router.post('/', async (req, res) => {
  try {
    const { customerId, amountPaid, paymentMethod, cardNumber, gmail } = req.body;

    if (!customerId || !amountPaid || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // When saving payment, set approved: false by default
    const newPayment = new Payment1({
      customerId,
      amountPaid,
      paymentMethod,
      cardLast4Digits: cardNumber?.slice(-4) || null,
      gmail: gmail || null,
      approved: false // <-- add this field
    });

    await newPayment.save();
    res.status(201).json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Payment Save Error:', error);
    res.status(500).json({ message: 'Server error while saving payment' });
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

module.exports = router;
