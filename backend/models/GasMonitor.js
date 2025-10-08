const mongoose = require('mongoose');

const gasMonitorSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // ✅ Ensures only one monitor document can exist per user
  },
  gmail: { type: String, required: true },
  gasLevel: { type: Number, required: true, default: 100 },
  leakageDetected: { type: Boolean, default: false },
  alertMessage: { type: String, default: '' },
}, {
  timestamps: true // ✅ Automatically manages createdAt and updatedAt fields
});

module.exports = mongoose.model('GasMonitor', gasMonitorSchema);