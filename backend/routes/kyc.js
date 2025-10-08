const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define the schema
const kycSchema = new mongoose.Schema({
  salutation: String,
  firstName: String,
  middleName: String,
  lastName: String,
  dob: String,
  fatherName: String,
  spouseName: String,
  motherName: String,
  houseName: String,
  floorNo: String,
  housingComplex: String,
  streetName: String,
  landmark: String,
  city: String,
  state: String,
  district: String,
  pinCode: String,
  mobileNumber: String,
  email: { type: String, unique: true, required: true },
  status: { type: String, default: "pending" } // <-- add status field
}, { timestamps: true });

// Create the model
const KYCForm = mongoose.model('KYCFormm', kycSchema);

// ✅ Route to check for duplicate email or mobileNumber
router.post('/check-duplicate', async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;
    const errors = {};

    if (email) {
      const emailExists = await KYCForm.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) errors.email = 'The email is already used.';
    }

    if (mobileNumber) {
      const mobileExists = await KYCForm.findOne({ mobileNumber: mobileNumber.trim() });
      if (mobileExists) errors.mobileNumber = 'The mobile number is already used.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(409).json(errors);
    }

    res.status(200).json({ message: 'No duplicates found' });
  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
    res.status(500).json({ message: 'Server error while checking duplicates' });
  }
});

// ✅ Route to submit KYC form
router.post('/', async (req, res) => {
  try {
    const newForm = new KYCForm({
      ...req.body,
      status: "pending" // <-- always set status to pending on new request
    });
    await newForm.save();
    res.status(201).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('❌ KYC form save error:', error);
    res.status(500).json({ message: 'Server error while saving KYC form' });
  }
});

// ✅ Route to get user's KYC data by email
router.get('/user/me', async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    const kycData = await KYCForm.findOne({ email: userEmail.toLowerCase().trim() });
    if (!kycData) {
      return res.status(404).json({ message: 'KYC data not found' });
    }
    res.status(200).json(kycData);
  } catch (error) {
    console.error('Error fetching KYC data:', error);
    res.status(500).json({ message: 'Server error while fetching KYC data' });
  }
});

// ✅ Route for updating user profile
router.put('/user/update', async (req, res) => {
    try {
        const { email, ...updateFields } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required for update' });
        }

        const updatedProfile = await KYCForm.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json({ message: 'Profile updated successfully', data: updatedProfile });
    } catch (error) {
        console.error('❌ Profile update error:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});

// ✅ Admin: Get all connection requests (optionally filter by status)
router.get('/requests', async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status ? { status } : {};
    const requests = await KYCForm.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching requests' });
  }
});

// ✅ Admin: Approve or reject a connection request
router.post('/requests/:id/action', async (req, res) => {
  try {
    const { action } = req.body; // "approved" or "rejected"
    if (!["approved", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }
    const updated = await KYCForm.findByIdAndUpdate(
      req.params.id,
      { status: action },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Request not found" });
    res.json({ message: `Request ${action}`, data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating request' });
  }
});

// Route to check KYC and payment status for the logged-in user
router.get('/status', async (req, res) => {
  try {
    // Get user email from session/JWT or from backend user (if available)
    let userEmail = req.query.email;
    if (!userEmail && req.user && req.user.email) {
      userEmail = req.user.email;
    }
    if (!userEmail) {
      return res.json({ kycSubmitted: false, paymentDone: false });
    }
    // Check if KYC exists for user
    const kyc = await KYCForm.findOne({ email: userEmail.toLowerCase().trim() });
    // Check if payment is done and approved
    const Payment1 = require('../models/Payment');
    const payment = await Payment1.findOne({ gmail: userEmail.toLowerCase().trim(), approved: true });
    res.json({
      kycSubmitted: !!kyc,
      paymentDone: !!payment
    });
  } catch (err) {
    res.json({ kycSubmitted: false, paymentDone: false });
  }
});

// Route to check KYC status and admin action for the logged-in user
router.get('/status-and-action', async (req, res) => {
  try {
    let userEmail = req.query.email;
    if (!userEmail && req.user && req.user.email) {
      userEmail = req.user.email;
    }
    if (!userEmail) {
      return res.json({ kycSubmitted: false, status: null, redirectToPayment: false, showRejectMessage: false });
    }
    const kyc = await KYCForm.findOne({ email: userEmail.toLowerCase().trim() });
    if (!kyc) {
      return res.json({ kycSubmitted: false, status: null, redirectToPayment: false, showRejectMessage: false });
    }
    let redirectToPayment = false;
    let showRejectMessage = false;
    // status will be "approved" if admin approved
    if (kyc.status === "approved") {
      redirectToPayment = true;
    } else if (kyc.status === "rejected") {
      showRejectMessage = true;
    }
    res.json({
      kycSubmitted: true,
      status: kyc.status,
      redirectToPayment,
      showRejectMessage
    });
  } catch (err) {
    res.json({ kycSubmitted: false, status: null, redirectToPayment: false, showRejectMessage: false });
  }
});

module.exports = router;