// routes/register.js
const express = require('express');
const bcrypt = require('bcrypt'); // 👈 import bcrypt
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  console.log("📥 Registration data received:", req.body);

  const { fullName, phone, email, password } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password before saving 👇
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const newUser = new User({ 
      fullName, 
      phone, 
      email, 
      password: hashedPassword, // store hashed password
      role: 'user' // Explicitly set role
    });
    await newUser.save();

    console.log("✅ User saved to MongoDB");
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully!',
      role: newUser.role 
    });
  } catch (err) {
    console.error("❌ Error saving user:", err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
