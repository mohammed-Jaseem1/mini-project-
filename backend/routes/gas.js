const express = require('express');
const jwt = require('jsonwebtoken');
const GasMonitor = require('../models/GasMonitor');
const User = require('../models/User');
const router = express.Router();

// ✅ GET latest simulated gas status (logged-in user)
router.get('/status', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check last entry for this user
    let lastEntry = await GasMonitor.findOne({ customerId: user._id }).sort({ createdAt: -1 });
    let gasLevel = 100;
    let leakageDetected = false;
    let alertMessage = '';

    if (lastEntry) {
      const now = new Date();
      const diffMs = now - lastEntry.createdAt;
      const diffSec = diffMs / 1000;

      // If last reading is very recent (<5s), return it instead of creating new
      if (diffSec < 5) {
        return res.json(lastEntry);
      }

      // Decrease gas level by 1 each request
      gasLevel = Math.max(0, lastEntry.gasLevel - 1);
    } else {
      gasLevel = 100; // Always start at 100 for new user
    }

    // ✅ Leakage only between 50 and 45
    leakageDetected = (gasLevel <= 50 && gasLevel >= 45);

    // ✅ Alert logic
    if (gasLevel < 20 && leakageDetected) {
      alertMessage = '⚠️ Low Gas Level! Please Refill Soon.\n🚨 Gas Leakage Detected! Take Immediate Action!';
    } else if (gasLevel < 20) {
      alertMessage = '⚠️ Low Gas Level! Please Refill Soon.';
    } else if (leakageDetected) {
      alertMessage = '🚨 Gas Leakage Detected! Take Immediate Action!';
    }

    // Save entry
    const reading = new GasMonitor({
      customerId: user._id,
      gmail: user.email,
      gasLevel,
      leakageDetected,
      alertMessage,
    });

    await reading.save();
    res.json(reading);
  } catch (err) {
    console.error('Gas status error:', err.message);
    res.status(500).json({ message: 'Error fetching gas status' });
  }
});

// ✅ GET last saved gas status (without new simulation)
router.get('/latest', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const latestStatus = await GasMonitor.findOne({ customerId: user._id })
      .sort({ createdAt: -1 });

    if (!latestStatus) {
      return res.status(404).json({ message: 'No gas status found' });
    }

    res.json(latestStatus);
  } catch (err) {
    console.error('GET latest gas status error:', err.message);
    res.status(500).json({ message: 'Error fetching latest gas status' });
  }
});

// ✅ GET last 7 gas readings (logged-in user)
router.get('/history', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = await GasMonitor.find({ customerId: user._id })
      .sort({ createdAt: -1 })
      .limit(7);

    res.json(history.reverse()); // oldest first
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gas history' });
  }
});

module.exports = router;
