require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const kycRoute = require('./routes/kyc');
const paymentRoute = require('./routes/payment');
const feedbackRoute = require('./routes/feedback');
const autoBookingRoutes = require('./routes/autoBookingRoutes');
const sensorRoutes = require("./routes/Sensors");
const gasRoutes = require('./routes/gas');

const User = require('./models/User');
const Payment = require('./models/Payment');
const GasMonitor = require('./models/GasMonitor');
const Feedback = require('./models/Feedback');
const AutoBook1 = require('./models/AutoBooking');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin ||
        origin.includes('localhost') ||
        origin.includes('192.168.1.93') ||
        origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ✅ Routes
app.use('/api/login', loginRoute);
app.use('/api/register', registerRoute);
app.use('/api/kyc', kycRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/feedback', feedbackRoute);
app.use("/api/sensor", sensorRoutes);
app.use('/api/gas', gasRoutes);
app.use('/api', autoBookingRoutes); // Add this line to register autoBookingRoutes

// ✅ POST: Save Payment
app.post('/api/payment', async (req, res) => {
  try {
    let {
      customerId,
      amountPaid,
      paymentMethod,
      cardLast4Digits,
      expiry,
      cvv,
      billingAddress,
      gmail
    } = req.body;

    console.log('📥 Payment received:', req.body);

    // Validate required fields
    if (!gmail || !amountPaid) {
      return res.status(400).json({ message: 'Email and amount are required' });
    }

    // ✅ Validate card expiry date
    if (expiry && (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card')) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
      
      // Parse expiry date (expected format: MM/YY)
      const expiryParts = expiry.split('/');
      if (expiryParts.length === 2) {
        const expiryMonth = parseInt(expiryParts[0], 10);
        const expiryYear = parseInt('20' + expiryParts[1], 10); // Convert YY to 20YY
        
        // Check if card is expired
        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
          return res.status(400).json({ 
            message: 'Payment failed: Card has expired. Please use a valid card.' 
          });
        }
      } else {
        return res.status(400).json({ 
          message: 'Invalid expiry date format. Please use MM/YY format.' 
        });
      }
    }

    // Ensure we have a user and customerId for Payment model
    let userForPayment;
    if (customerId) {
      const isValidId = mongoose.Types.ObjectId.isValid(customerId);
      if (isValidId) {
        userForPayment = await User.findById(customerId);
      } else {
        // Fall back to email lookup if provided id is invalid
        userForPayment = await User.findOne({ email: gmail });
      }
    } else {
      userForPayment = await User.findOne({ email: gmail });
    }
    if (!userForPayment) {
      return res.status(400).json({ message: 'User not found for provided email/customerId' });
    }
    customerId = userForPayment._id.toString();

    // Default payment method if not provided (to avoid schema validation error)
    const normalizedPaymentMethod = paymentMethod || 'Online';

    const payment = new Payment({
      customerId,
      amountPaid,
      paymentMethod: normalizedPaymentMethod,
      cardLast4Digits,
      expiry,
      cvv,
      billingAddress,
      gmail,
    });

    await payment.save();
    console.log('💳 Payment saved successfully:', payment._id);

    // ✅ Refill gas after payment - Enhanced debugging
    const user = userForPayment;
    console.log('👤 User lookup result:', user ? `Found: ${user.email}` : 'Not found');
    
    if (user) {
      try {
        // Update or create the user's gas record to reflect the refill
        console.log('🔍 Updating gas record to reflect refill...');
        const updatedRecord = await GasMonitor.findOneAndUpdate(
          { customerId: user._id },
          {
            gmail: user.email,
            gasLevel: 100,
            leakageDetected: false,
            alertMessage: '✅ Gas tank refilled successfully!',
            source: 'refill'
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('✅ Gas refill updated:', {
          id: updatedRecord._id,
          customerId: updatedRecord.customerId,
          gasLevel: updatedRecord.gasLevel,
          createdAt: updatedRecord.createdAt
        });

        // Update auto-booking status if exists
        const pendingBooking = await AutoBook1.findOne({
          userId: user._id,
          refillStatus: "Pending"
        });

        console.log('📋 Pending booking check:', pendingBooking ? `Found: ${pendingBooking._id}` : 'None found');

        if (pendingBooking) {
          const updatedBooking = await AutoBook1.findByIdAndUpdate(
            pendingBooking._id,
            {
              refillStatus: "Completed",
              paymentId: payment._id,
              deliveryDate: new Date()
            },
            { new: true }
          );
          console.log('✅ Auto-booking updated:', updatedBooking);
        }

        // Verify the refill was saved by checking latest reading
        const latestReading = await GasMonitor.findOne({ customerId: user._id }).sort({ createdAt: -1 });
        console.log('🔍 Latest gas reading after refill:', {
          gasLevel: latestReading?.gasLevel,
          createdAt: latestReading?.createdAt,
          source: latestReading?.source
        });

      } catch (refillError) {
        console.error('❌ Detailed refill error:', {
          message: refillError.message,
          stack: refillError.stack,
          name: refillError.name
        });
        
        // Check if it's a validation error
        if (refillError.name === 'ValidationError') {
          console.error('📋 Validation errors:', refillError.errors);
        }
        
        // Continue even if refill fails - payment is still successful
      }
    } else {
      console.log('⚠️ User not found for email:', gmail);
      console.log('🔍 Checking all users with similar emails...');
      const similarUsers = await User.find({ 
        email: { $regex: gmail.split('@')[0], $options: 'i' } 
      }).select('email');
      console.log('📧 Similar emails found:', similarUsers.map(u => u.email));
    }

    res.status(201).json({ 
      message: 'Payment saved successfully',
      paymentId: payment._id 
    });
  } catch (err) {
    console.error('❌ Payment save error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ 
      message: 'Server error while saving payment',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ✅ GET: Payment List
app.get('/api/payment', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching payments' });
  }
});

// ✅ GET: User Payment History
app.get('/api/payment/user-history/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    console.log('Fetching payments for:', userEmail);
    
    const payments = await Payment.find({ gmail: userEmail })
      .sort({ date: -1 });
    
    console.log('Found payments:', payments);
    
    if (!payments || payments.length === 0) {
      return res.json([]);
    }
    
    res.json(payments);
  } catch (err) {
    console.error('Error fetching user payments:', err);
    res.status(500).json({ message: 'Server error while fetching payments' });
  }
});

// ✅ GET: Current Logged-in User
app.get('/api/user/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('email phone');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error in /api/user/me:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ✅ API: Gas Status (ONLY from real sensors - no simulation)
app.get('/api/gas/status', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get the most recent reading (including refills)
    const lastEntry = await GasMonitor.findOne({ 
      customerId: user._id
    }).sort({ createdAt: -1 });
    
    if (!lastEntry) {
      return res.json({
        message: 'No sensor readings available. Please start your Wokwi simulation.',
        gasLevel: null,
        leakageDetected: false,
        alertMessage: 'Waiting for sensor data...'
      });
    }

    // ✅ Check if auto-booking is needed when gas is low
    if (lastEntry.gasLevel <= 20) {
      try {
        // Remove the check for existingBooking if you want to always create a booking
        const autoBooking = new AutoBook1({
          userId: user._id,
          gmail: user.email,
          gasLevel: lastEntry.gasLevel,
          address: {
            street: user.address || 'Not provided',
            city: user.city || 'Not provided',
            state: user.state || 'Not provided',
            pincode: user.pincode || '000000'
          },
          customerPhone: user.phone || 'Not provided',
          totalAmount: 900,
          quantity: 1,
          refillStatus: "Pending"
        });
        await autoBooking.save();
        console.log(`🔔 Auto-booking created for ${user.email} at gas level ${lastEntry.gasLevel}%`);
      } catch (bookingError) {
        console.error('❌ Auto-booking creation error:', bookingError);
        // Don't fail the entire request if auto-booking fails
      }
    }

    res.json(lastEntry);
  } catch (err) {
    console.error('Gas Status Error:', err);
    res.status(500).json({ message: 'Server error in gas status' });
  }
});

// ✅ Block any automatic simulation endpoints
app.post('/api/gas/simulate', (req, res) => {
  res.status(405).json({ message: 'Gas simulation is disabled. Use Wokwi instead.' });
});

app.put('/api/gas/simulate', (req, res) => {
  res.status(405).json({ message: 'Gas simulation is disabled. Use Wokwi instead.' });
});

// ✅ Auto-booking History
app.get('/api/gas/booking-history/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    const bookings = await AutoBook1.find({ gmail: userEmail }).sort({ createdAt: -1 });
    
    const formattedBookings = bookings.map(booking => ({
      createdAt: booking.createdAt,
      type: 'Auto Booking',
      totalAmount: booking.totalAmount || 950,
      refillStatus: booking.refillStatus || 'Pending'
    }));
    
    res.json(formattedBookings);
  } catch (err) {
    console.error('Error fetching booking history:', err);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

// ✅ Get auto-bookings for user
app.get('/api/gas/auto-bookings/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    const user = await User.findOne({ email: userEmail });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const bookings = await AutoBook1.find({ userId: user._id }).sort({ createdAt: -1 });
    
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      email: userEmail,
      gasLevel: booking.gasLevel,
      bookingDate: booking.createdAt,
      refillStatus: booking.refillStatus || 'Pending',
      totalAmount: booking.totalAmount || 900
    }));
    
    res.json(formattedBookings);
  } catch (err) {
    console.error('Error fetching auto bookings:', err);
    res.status(500).json({ error: 'Failed to fetch auto bookings' });
  }
});

// ✅ Admin: Get All Gas Readings
app.get('/api/gas/all-readings', async (req, res) => {
  try {
    const readings = await GasMonitor.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(readings);
  } catch (err) {
    console.error('Error fetching gas readings:', err);
    res.status(500).json({ error: 'Failed to fetch gas readings' });
  }
});

// ✅ Admin Middleware
const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ✅ Admin: Get All Users
app.get('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('email createdAt status lastActive phone address')
      .sort({ createdAt: -1 });
    
    const formattedUsers = users.map(user => ({
      _id: user._id,
      email: user.email,
      createdAt: user.createdAt,
      status: user.status || 'Active',
      lastActive: user.lastActive || user.createdAt,
      phone: user.phone,
      address: user.address
    }));
    
    res.json(formattedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ Admin: Reports
app.get('/api/admin/reports', async (req, res) => {
  try {
    const [users, payments, gasReadings] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }),
      Payment.find().sort({ createdAt: -1 }),
      GasMonitor.find().sort({ createdAt: -1 }).limit(100)
    ]);

    res.json({
      users: users.map(user => ({
        _id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        status: user.status || 'Active',
        lastActive: user.lastActive || user.createdAt
      })),
      payments: payments.map(payment => ({
        _id: payment._id,
        email: payment.gmail,
        amount: payment.amountPaid,
        date: payment.date,
        status: payment.approved ? 'Completed' : 'Pending'
      })),
      gasUsage: gasReadings.map(reading => ({
        _id: reading._id,
        email: reading.gmail,
        gasLevel: reading.gasLevel,
        date: reading.createdAt,
        status: reading.leakageDetected ? 'Leakage Detected' : 'Normal'
      }))
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// ✅ Admin: Monthly Report API
app.get('/api/report/monthly-report', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required.' });
    }
    const monthInt = parseInt(month, 10);
    const yearInt = parseInt(year, 10);

    // Calculate start and end dates for the month
    const startDate = new Date(yearInt, monthInt - 1, 1, 0, 0, 0);
    const endDate = new Date(yearInt, monthInt, 1, 0, 0, 0);

    // Fetch gas readings for the month
    const readings = await GasMonitor.find({
      createdAt: { $gte: startDate, $lt: endDate }
    });

    // Fetch payments for the month
    const payments = await Payment.find({
      date: { $gte: startDate, $lt: endDate }
    });

    // Calculations
    const totalReadings = readings.length;
    const avgGasLevel = totalReadings > 0 ? (readings.reduce((sum, r) => sum + (r.gasLevel || 0), 0) / totalReadings).toFixed(2) : 0;
    const maxGasLevel = totalReadings > 0 ? Math.max(...readings.map(r => r.gasLevel || 0)) : 0;
    const minGasLevel = totalReadings > 0 ? Math.min(...readings.map(r => r.gasLevel || 0)) : 0;
    // Count alerts by gasLevel > 700 OR leakageDetected === true
    const alertCount = readings.filter(r => (r.gasLevel > 700) || r.leakageDetected === true).length;
    const totalIncome = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

    res.json({
      month: monthInt,
      year: yearInt,
      totalReadings,
      avgGasLevel: Number(avgGasLevel),
      maxGasLevel,
      minGasLevel,
      alertCount,
      totalIncome
    });
  } catch (err) {
    console.error('Monthly report error:', err);
    res.status(500).json({ message: 'Server error generating monthly report.' });
  }
});

// ✅ GET: Feedback List (with optional status filter)
app.get('/api/feedback', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
});

// ✅ PUT: Update Feedback Status
app.put('/api/feedback/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!status) return res.status(400).json({ message: 'Status is required.' });
    // Update both status and reviewStatus for consistency
    const updated = await Feedback.findByIdAndUpdate(
      id,
      { $set: { status, reviewStatus: status, reviewedAt: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Feedback not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating feedback status.' });
  }
});

// ✅ Root Route
app.get('/', (req, res) => res.send('API running'));

// ✅ Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('➡️ Make sure your current IP address is whitelisted in MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/');
    console.error('➡️ Also check your MONGO_URI in .env and network connectivity.');
  });
