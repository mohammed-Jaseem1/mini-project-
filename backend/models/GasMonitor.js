const mongoose = require('mongoose');

const gasMonitorSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gmail: { type: String, required: true },
  gasLevel: { type: Number, required: true },
  leakageDetected: { type: Boolean, default: false },
  alertMessage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GasMonitor', gasMonitorSchema);
