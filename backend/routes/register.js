const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check for duplicate email or phone only (remove name check)
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "This email is already registered" });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ message: "This phone number is already registered" });
      }
      // Name check removed
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const user = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "user",
    });

    await user.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "An unexpected server error occurred" });
  }
});

module.exports = router;
