// routes/register.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  console.log("📥 Registration data received:", req.body);

  const { fullName, phone, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ fullName, phone, email, password });
    await newUser.save();

    console.log("✅ User saved to MongoDB");
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error("❌ Error saving user:", err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router; // ✅ Make sure this is at the bottom
