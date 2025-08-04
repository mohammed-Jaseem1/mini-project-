const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  console.log("📥 Registration data received:", req.body); // <-- DEBUG

  const { fullName, phone, email, password } = req.body;

  try {
    const newUser = new User({ fullName, phone, email, password });
    await newUser.save();
    console.log("✅ User saved to MongoDB"); // <-- DEBUG
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error("❌ Error saving user:", err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
