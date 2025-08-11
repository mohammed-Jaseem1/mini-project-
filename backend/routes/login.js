const express = require('express');
const router = express.Router();
const LoginUser = require('../models/User'); // Your User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/login
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await LoginUser.findOne({ email });
    console.log('User:', user);

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Convert isAdmin boolean to role string
    const role = user.isAdmin ? 'admin' : 'user';

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role },                 // <-- Use role here
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    // Send role and token in response
    res.json({
      message: 'Login successful',
      role,                                   // <-- Send role, not user.role
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
