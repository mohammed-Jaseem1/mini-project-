const express = require("express");
const router = express.Router();
const Sensor = require("../models/Sensors");

const SINGLETON_ID = 'latest_sensor_reading';

// Save (Update) sensor data - Updates the single record
router.post("/", async (req, res) => {
  try {
    const { gasLevel, gasValue, digitalValue } = req.body;
    
    // Use gasLevel if provided, otherwise use gasValue
    const level = gasLevel !== undefined ? gasLevel : (gasValue || 0);
    
    // Determine status based on gas level
    let status = 'normal';
    if (digitalValue === 1 || level < 20) {
      status = 'leak';
    } else if (level < 40) {
      status = 'low';
    } else if (level < 70) {
      status = 'medium';
    }
    
    // ✅ Update the singleton document instead of creating a new one
    const updatedData = await Sensor.findByIdAndUpdate(
      SINGLETON_ID,
      {
        gasLevel: level,
        gasValue: gasValue,
        digitalValue: digitalValue,
        status: status
        // updatedAt set automatically
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    console.log(`Generic Sensor updated - Level: ${level}%, Status: ${status}`);
    res.json({ success: true, message: "Data updated", data: updatedData });
  } catch (err) {
    console.error('Error updating sensor data:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get latest data - Fetches the single record
router.get("/", async (req, res) => {
  try {
    const record = await Sensor.findById(SINGLETON_ID);
    // Return as an array to maintain potential frontend compatibility based on previous code's .find()
    res.json(record ? [record] : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;