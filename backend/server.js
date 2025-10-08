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
const Feedback = require('./models/Feedback'); // Add this line with other models
const AutoBook1 = require('./models/AutoBooking'); // Change from './models/AutoBook1'


const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like ESP32) or from localhost/IP
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
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ✅ Routes
app.use('/api/login', loginRoute);
app.use('/api/register', registerRoute);
app.use('/api/kyc', kycRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/feedback', feedbackRoute);
app.use('/api', autoBookingRoutes);
app.use("/api/sensor", sensorRoutes);
app.use('/api/gas', gasRoutes);

// ✅ POST: Save Payment
app.post('/api/payment', async (req, res) => {
  try {
    // Accept all payment fields from frontend
    const {
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

    const payment = new Payment({
      customerId,
      amountPaid,
      paymentMethod,
      cardLast4Digits, // last 4 digits
      expiry,          // MM/YY
      cvv,             // 3 digits
      billingAddress,  // { address, city, state, zip }
      gmail,
    });

    await payment.save();

    // Refill gas after payment
    const user = await User.findOne({ email: gmail });
    if (user) {
      const reading = new GasMonitor({
        customerId: user._id,
        gmail: user.email,
        gasLevel: 100,
        leakageDetected: false,
        alertMessage: '',
      });
      await reading.save();
    }

    // Update auto-booking status if exists
    if (user) {
      const pendingBooking = await AutoBook1.findOne({
        userId: user._id,
        refillStatus: "Pending"
      });

      if (pendingBooking) {
        await AutoBook1.findByIdAndUpdate(
          pendingBooking._id,
          {
            refillStatus: "Completed",
            paymentId: payment._id,
            deliveryDate: new Date()
          }
        );
      }
    }

    res.status(201).json({ message: 'Payment saved successfully' });
  } catch (err) {
    console.error('❌ Payment save error:', err);
    res.status(500).json({ message: 'Server error while saving payment' });
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

// Move this route before other payment routes
app.get('/api/payment/user-history/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    console.log('Fetching payments for:', userEmail); // Debug log
    
    const payments = await Payment.find({ gmail: userEmail })
      .sort({ date: -1 });
    
    console.log('Found payments:', payments); // Debug log
    
    if (!payments || payments.length === 0) {
      return res.json([]); // Return empty array instead of 404
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

// ✅ API: Gas Status (simulation per logged-in user)
app.get('/api/gas/status', async (req, res) => {
  try {
    // ✅ Get logged-in user
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Check last entry
    let lastEntry = await GasMonitor.findOne({ customerId: user._id }).sort({ createdAt: -1 });
    let gasLevel = 100;

    if (lastEntry) {
      const now = new Date();
      const diffMs = now - lastEntry.createdAt;
      const diffSec = diffMs / 1000;

      if (diffSec < 5) {
        // Return latest entry without creating new one
        return res.json(lastEntry);
      }

      // Decrease by 1 per call
      gasLevel = Math.max(0, lastEntry.gasLevel - 1);
    }

    // ✅ Leakage only if gasLevel is between 50 and 45
    const leakageDetected = (gasLevel <= 50 && gasLevel >= 45);

    // ✅ Alert messages
    let alertMessage = '';
    if (gasLevel < 20 && leakageDetected) {
      alertMessage = '⚠️ Low Gas Level! Please Refill Soon.\n🚨 Gas Leakage Detected! Take Immediate Action!';
    } else if (gasLevel < 20) {
      alertMessage = '⚠️ Low Gas Level! Please Refill Soon.';
    } else if (leakageDetected) {
      alertMessage = '🚨 Gas Leakage Detected! Take Immediate Action!';
    }

    // ✅ Save new entry
    const reading = new GasMonitor({
      customerId: user._id,
      gmail: user.email,
      gasLevel,
      leakageDetected,
      alertMessage,
    });

    await reading.save();

    // Add auto-booking creation when gas level is low
    if (gasLevel <= 20) {
      // Check for existing pending booking
      const existingBooking = await AutoBook1.findOne({
        userId: user._id,
        refillStatus: "Pending"
      });

      if (!existingBooking) {
        const autoBooking = new AutoBook1({
          userId: user._id,
          gasLevel,
          address: {
            street: user.address || '',
            city: user.city || '',
            state: user.state || '',
            pincode: user.pincode || ''
          },
          customerPhone: user.phone,
          totalAmount: 900, // Default amount
          quantity: 1
        });
        await autoBooking.save();
      }
    }

    res.json(reading);

  } catch (err) {
    console.error('Gas Simulation Error:', err);
    res.status(500).json({ message: 'Server error in gas simulator' });
  }
});

// Get auto-booking history for user
app.get('/api/gas/booking-history/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    const bookings = await AutoBook1.find({ 
      gmail: userEmail // Update to match the field in AutoBook1 schema
    })
    .sort({ createdAt: -1 });
    
    // Transform the data to match the expected format
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

// Update the auto-bookings route
app.get('/api/gas/auto-bookings/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bookings = await AutoBook1.find({ 
      userId: user._id,
      gasLevel: { $lte: 20 }
    }).sort({ createdAt: -1 });
    
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      email: userEmail,  // Add email to response
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

// Get all gas readings for admin
app.get('/api/gas/all-readings', async (req, res) => {
  try {
    const readings = await GasMonitor.find()
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 readings
    res.json(readings);
  } catch (err) {
    console.error('Error fetching gas readings:', err);
    res.status(500).json({ error: 'Failed to fetch gas readings' });
  }
});

// Admin middleware to check if user is admin
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

// Updated admin users endpoint with auth
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

// Add admin reports endpoints
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

