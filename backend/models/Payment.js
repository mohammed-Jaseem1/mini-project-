const mongoose = require('mongoose');

const payment1Schema = new mongoose.Schema({
  customerId: { type: String, required: true }, // <-- ensure type is String
  amountPaid: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  cardLast4Digits: { type: String },
  gmail: { type: String },
  date: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false } // <-- add this field
});

module.exports = mongoose.model('Payment1', payment1Schema);
