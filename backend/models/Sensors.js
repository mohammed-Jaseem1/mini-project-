const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema({
  // ✅ Force a singleton ID so this collection only holds the "latest" state
  _id: { type: String, default: 'latest_sensor_reading' }, 
  gasLevel: { type: Number, required: true },
  gasValue: { type: Number, required: false },
  digitalValue: { type: Number, required: false },
  status: { 
    type: String, 
    enum: ['normal', 'low', 'medium', 'leak'],
    default: 'normal'
  }
}, {
  timestamps: true // ✅ Manages updatedAt automatically
});

module.exports = mongoose.model("Sensor", SensorSchema);