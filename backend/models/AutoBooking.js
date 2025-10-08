const mongoose = require("mongoose");

const autoBook1Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    gasLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    refillStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending"
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    deliveryDate: {
      type: Date
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment"
    },
    customerPhone: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    totalAmount: {
      type: Number,
      required: true
    },
    notes: String,
    emergencyContact: String,
    preferredTimeSlot: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening"],
      default: "Morning"
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add virtual fields for better data access
autoBook1Schema.virtual('userName').get(function() {
  return this.userId ? this.userId.name : 'N/A';
});

autoBook1Schema.virtual('userEmail').get(function() {
  return this.userId ? this.userId.email : 'N/A';
});

// Make sure to export the model correctly
const AutoBook1 = mongoose.model("AutoBook1", autoBook1Schema);
module.exports = AutoBook1;

