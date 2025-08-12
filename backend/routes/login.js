const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Admin = require('../models/Admin');

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);  // Debug log
    
    // Check admin first
    const admin = await Admin.findOne({ email });
    if (admin) {
      const validPassword = await bcrypt.compare(password, admin.password);
      if (validPassword) {
        return res.json({
          success: true,
          message: "Login successful",
          role: 'admin',
          email: admin.email
        });
      }
    }

    // Check regular user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      role: 'user',
      email: user.email
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: "Server error occurred" });
  }
});

module.exports = router;

