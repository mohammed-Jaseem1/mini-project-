const mongoose = require('mongoose');

const payment1Schema = new mongoose.Schema({
  customerId: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  cardLast4Digits: { type: String },
  expiry: { type: String },
  cvv: { type: String },
  billingAddress: {
    address: String,
    city: String,
    state: String,
    pincode: String // <-- change zip to pincode
  },
  gmail: { type: String },
  date: { type: Date, default: Date.now },
  approved: { type: Boolean, default: true }
});

payment1Schema.statics.findByUserGmail = function(gmail) {
  return this.find({ gmail: gmail }).sort({ date: -1 });
};

module.exports = mongoose.model('Payment1', payment1Schema);
