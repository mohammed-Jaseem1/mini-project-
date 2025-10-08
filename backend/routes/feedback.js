const express = require("express");
const router = express.Router();
const Feedback = require('../models/Feedback'); // Update this line
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Submit feedback
router.post("/", async (req, res) => {
  try {
    console.log('Received feedback data:', req.body);
    const { type, subject, description, priority } = req.body;
    
    // Get user from token instead of session
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const feedback = new Feedback({
      type,
      subject,
      description,
      priority,
      userId: user._id,
      email: user.email
    });

    await feedback.save();
    console.log("Feedback saved:", feedback);
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(400).json({ 
      message: "Error submitting feedback",
      error: err.message 
    });
  }
});

// Get all feedbacks (admin only)
router.get("/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    res.status(500).json({ message: "Error fetching feedbacks" });
  }
});

// Update feedback status
router.put("/:id/review", async (req, res) => {
  try {
    const { adminResponse, reviewStatus } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse,
        reviewStatus,
        reviewedAt: new Date(),
      },
      { new: true }
    );
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback);
  } catch (err) {
    console.error("Error updating feedback:", err);
    res.status(500).json({ message: "Error updating feedback" });
  }
});

module.exports = router;

