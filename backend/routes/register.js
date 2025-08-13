const express = require('express');
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
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Save new user
    const newUser = new User({ fullName, phone, email, password });
    await newUser.save();

    console.log("✅ User saved to MongoDB");
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: "Error saving user" });
  }
});

module.exports = router;