const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Add this

const router = express.Router();

const UserSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email: String,
  password: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

router.post("/", async (req, res) => {
  const { fullName, phone, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ fullName, phone, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error saving user" });
  }
});

module.exports = router;