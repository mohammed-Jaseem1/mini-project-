const express = require('express');
const jwt = require('jsonwebtoken');
const GasMonitor = require('../models/GasMonitor');
const AutoBook1 = require('../models/AutoBooking');
const User = require('../models/User');
const router = express.Router();

/**
 * @description Determines gas status based on data from the ESP32.
 * The backend now TRUSTS the ESP32 to report leaks.
 * @param {number} gasLevel - The percentage of gas remaining.
 * @param {number} [digitalValue=0] - The digital reading from the sensor (1 means leak).
 * @returns {{leakageDetected: boolean, alertMessage: string, status: string}}
 */
const determineGasStatus = (gasLevel, digitalValue = 0) => {
  // Leak status is now determined *only* by the ESP32's report.
  const leakageDetected = (digitalValue === 1);
  const isLowGas = (gasLevel < 20);
  let alertMessage = '';
  let status = 'normal';

  if (leakageDetected && isLowGas) {
    status = 'critical';
    alertMessage = 'CRITICAL: Gas Leak Detected AND Low Tank!';
  } else if (leakageDetected) {
    status = 'leak';
    alertMessage = 'ALARM: Gas Leak Detected!';
  } else if (isLowGas) {
    status = 'low';
    alertMessage = 'WARNING: Low Gas Level! Please Refill Soon.';
  } else if (gasLevel < 40) {
    status = 'medium';
    alertMessage = 'Medium Gas Level.';
  } else {
    status = 'normal';
    alertMessage = 'Gas Level Normal.';
  }

  return { leakageDetected, alertMessage, status };
};

// ✅ GET /status (Web Simulator)
// Simulates CONSUMPTION but NOT leaks. It reflects the last state set by the ESP32.
router.get('/status', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let currentEntry = await GasMonitor.findOne({ customerId: user._id });
    if (!currentEntry) {
        // If no record exists yet, create one and return it.
        currentEntry = new GasMonitor({ customerId: user._id, gmail: user.email });
        await currentEntry.save();
        return res.json(currentEntry);
    }

    // Do NOT simulate consumption here; just return the latest stored reading
    return res.json(currentEntry);
  } catch (err) {
    console.error('Gas status error:', err.message);
    res.status(500).json({ message: 'Error fetching gas status' });
  }
});


// ✅ POST /sensor & /consumption (ESP32 Endpoints)
// These routes process data from the ESP32 and update the single DB document.
const handleEsp32Update = async (req, res) => {
    try {
        const { userId, gasLevel, digitalValue } = req.body;
        if (!userId || gasLevel === undefined) {
          return res.status(400).json({ success: false, error: 'User ID and gas level are required' });
        }
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        
        // Determine the system status based on what the ESP32 has reported
        const { leakageDetected, alertMessage, status } = determineGasStatus(gasLevel, digitalValue);
        
        const updatedRecord = await GasMonitor.findOneAndUpdate(
          { customerId: user._id },
          {
            gmail: user.email,
            gasLevel: gasLevel,
            leakageDetected: leakageDetected,
            alertMessage: alertMessage,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        console.log(`[ESP32 Update] User: ${user.email}, Level: ${gasLevel}%, Status: ${status}`);

        // ✅ Trigger auto-booking when gas level is low (device-driven)
        if (gasLevel <= 20) {
          try {
            // Find the most recent booking for this user
            const lastBooking = await AutoBook1.findOne({ userId: user._id }).sort({ bookingDate: -1 });
            if (lastBooking) {
              if (lastBooking.refillStatus === 'Pending') {
                console.log(`ℹ️ [AutoBooking] Pending booking already exists for ${user.email}`);
                // Do not create another booking
                return;
              }
              if (lastBooking.refillStatus === 'Cancelled') {
                console.log(`⛔ [AutoBooking] Last booking was cancelled for ${user.email}`);
                // Do not create another booking
                return;
              }
            }
            // No pending/cancelled booking, create auto-booking
            const autoBooking = new AutoBook1({
              userId: user._id,
              gasLevel: gasLevel,
              customerPhone: user.phone || 'Not provided',
              totalAmount: 900,
              quantity: 1,
              refillStatus: 'Pending'
            });
            await autoBooking.save();
            console.log(`🔔 [AutoBooking] Created for ${user.email} at level ${gasLevel}%`);
          } catch (abErr) {
            console.error('❌ Auto-booking on sensor update failed:', abErr);
          }
        }
        res.json({ success: true, message: "Data updated successfully", reading: updatedRecord });
        
      } catch (err) {
        console.error('❌ Error processing ESP32 update:', err);
        res.status(500).json({ success: false, error: err.message });
      }
};

router.post('/sensor', handleEsp32Update);
router.post('/consumption', handleEsp32Update);


// ✅ POST /refill (Manual Override)
// Resets the gas level to 100% and clears any leak status.
router.post('/refill', async (req, res) => {
  try {
    const { userId, gasLevel } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID is required' });
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    const level = gasLevel || 100;
    
    const updatedRecord = await GasMonitor.findOneAndUpdate(
      { customerId: userId },
      {
        gmail: user.email,
        gasLevel: level,
        leakageDetected: false, // Explicitly reset leak status on refill
        alertMessage: `Gas Refilled to ${level}%`
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    console.log(`[Refill] User ${user.email} refilled to ${level}%`);
    res.json({ success: true, reading: updatedRecord });
    
  } catch (err) {
    console.error('❌ Error on refill:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// --- READ-ONLY ENDPOINTS ---

// ✅ GET last saved gas status (no simulation)
router.get('/latest', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const latestStatus = await GasMonitor.findOne({ customerId: decoded.id });

    if (!latestStatus) return res.status(404).json({ message: 'No gas status found for this user' });

    res.json(latestStatus);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching latest gas status' });
  }
});

// ✅ GET gas history (returns an array with only the single, current document)
router.get('/history', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentStatus = await GasMonitor.findOne({ customerId: decoded.id });
    
    // Return current status in an array to maintain API compatibility for frontends expecting a list
    res.json(currentStatus ? [currentStatus] : []);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gas history' });
  }
});

// ✅ GET user information and their current gas status by ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    const gasReading = await GasMonitor.findOne({ customerId: userId });
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone || 'N/A'
      },
      gasStatus: gasReading ? {
        gasLevel: gasReading.gasLevel,
        leakDetected: gasReading.leakageDetected,
        alert: gasReading.alertMessage,
        lastUpdated: gasReading.updatedAt
      } : {
        gasLevel: 100, // Default if no record exists yet
        leakDetected: false,
        alert: 'No readings yet',
        lastUpdated: null
      }
    });
    
  } catch (err) {
    console.error('❌ Error getting user info:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ GET a list of all users for ESP32 configuration purposes
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('_id fullName email').limit(20);
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.fullName,
        email: user.email,
        esp32Config: `String userId = "${user._id}"; // User: ${user.fullName}`
      }))
    });
    
  } catch (err) {
    console.error('❌ Error listing users:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;