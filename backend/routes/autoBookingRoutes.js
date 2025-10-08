const express = require("express");
const router = express.Router();
const AutoBook1 = require("../models/AutoBooking"); // Update path to match file name

// Verify model is loaded
console.log("AutoBook1 model loaded:", !!AutoBook1);

// Create Auto Booking (triggered if gasLevel < 20)
router.post("/autobook", async (req, res) => {
  try {
    const { userId, gasLevel, quantity } = req.body;

    // Validate gas level
    if (gasLevel > 20) {
      return res.status(400).json({ 
        message: "Gas level sufficient, auto-booking not needed." 
      });
    }

    // Check for existing pending booking
    const existingBooking = await AutoBook1.findOne({
      userId,
      refillStatus: "Pending"
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "There is already a pending booking for this user"
      });
    }

    const booking = new AutoBook1({
      userId,
      gasLevel,
      quantity: quantity || 1,
      totalAmount: 900, // Default amount
      customerPhone: req.body.customerPhone
    });

    await booking.save();

    const populatedBooking = await AutoBook1.findById(booking._id)
      .populate("userId", "name email phone");

    res.status(201).json({ 
      message: "Auto booking created successfully", 
      booking: populatedBooking 
    });
  } catch (error) {
    console.error("Auto-booking error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings (Admin)
router.get("/admin/autobookings", async (req, res) => {
  try {
    if (!AutoBook1.find) {
      throw new Error("AutoBook1 model not properly initialized");
    }
    
    const bookings = await AutoBook1.find()
      .populate("userId", "name email")
      .sort({ bookingDate: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error("Error in auto-bookings route:", err);
    res.status(500).json({ 
      error: "Failed to fetch auto-bookings",
      details: err.message 
    });
  }
});

// Get bookings by user
router.get("/autobookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await AutoBook1.find({ userId })
      .populate("userId", "name email phone")
      .populate("paymentId", "amount status")
      .sort({ bookingDate: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Update booking status (Admin)
router.put("/admin/autobookings/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, deliveryDate, notes } = req.body;

    const booking = await AutoBook1.findByIdAndUpdate(
      bookingId,
      { refillStatus: status, deliveryDate, notes },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status after payment
router.post("/autobookings/payment-complete", async (req, res) => {
  try {
    const { bookingId, paymentId } = req.body;

    const booking = await AutoBook1.findByIdAndUpdate(
      bookingId,
      { 
        refillStatus: "Completed",
        paymentId,
        deliveryDate: new Date()
      },
      { new: true }
    ).populate("userId", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ 
      message: "Booking status updated to completed", 
      booking 
    });
  } catch (error) {
    console.error("Payment completion error:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// Add cancel booking route
router.put("/bookings/cancel/:id", async (req, res) => {
  try {
    const booking = await AutoBook1.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.refillStatus !== "Pending") {
      return res.status(400).json({ error: "Only pending bookings can be cancelled" });
    }

    booking.refillStatus = "Cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

module.exports = router;
router.post("/autobook", async (req, res) => {
  try {
    const { userId, gasLevel, quantity } = req.body;

    if (!userId || gasLevel === undefined)
      return res.status(400).json({ message: "Missing userId or gasLevel" });

    if (gasLevel > 20) {
      return res.status(400).json({ message: "Gas level sufficient, auto-booking not needed." });
    }

    const existingBooking = await AutoBooking.findOne({
      userId,
      refillStatus: "Pending"
    });

    if (existingBooking) {
      return res.status(400).json({ message: "There is already a pending booking for this user" });
    }

    const booking = new AutoBooking({
      userId,
      gasLevel,
      quantity: quantity || 1,
      totalAmount: 900 // default
    });

    await booking.save();

    const populatedBooking = await AutoBooking.findById(booking._id).populate("userId", "name email phone");
    res.status(201).json({ message: "Auto booking created", booking: populatedBooking });

  } catch (error) {
    console.error("Auto-booking error:", error);
    res.status(500).json({ error: error.message });
  }
});
