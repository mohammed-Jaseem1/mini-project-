const express = require('express');
const router = express.Router();
const LoginUser = require('../models/User');
const Payment = require('../models/Payment'); // 1. Import the Payment model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/login
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await LoginUser.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const role = user.role || 'user';
    let hasPaid = false; // 2. Default payment status to false

    // 3. If the user is a regular user, check their payment status
    if (role === 'user') {
      const paymentRecord = await Payment.findOne({ gmail: user.email });
      if (paymentRecord) {
        hasPaid = true;
      }
    }

    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Lax',
      maxAge: 3600000
    });

    // 4. Send the role AND payment status in the response
    res.status(200).json({
      message: 'Login successful',
      role,
      hasPaid // <-- Send payment status to the client
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;