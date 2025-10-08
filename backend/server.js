// 



require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const kycRoute = require('./routes/kyc');
const paymentRoute = require('./routes/payment');

const User = require('./models/User');
const Payment = require('./models/Payment');
const GasMonitor = require('./models/GasMonitor');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use('/api/login', loginRoute);
app.use('/api/register', registerRoute);
app.use('/api/kyc', kycRoute);
app.use('/api/payments', paymentRoute);

// ✅ POST: Save Payment
app.post('/api/payment', async (req, res) => {
  try {
    // Accept only masked card info from frontend
    const { customerId, amountPaid, paymentMethod, cardLast4, cardNetwork, gmail } = req.body;

    console.log('📥 Payment received:', req.body);

    const payment = new Payment({
      customerId,
      amountPaid,
      paymentMethod,
      cardLast4,      // Save only last 4 digits
      cardNetwork,    // Save card network (Visa, Mastercard, etc.)
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
    res.json(reading);

  } catch (err) {
    console.error('Gas Simulation Error:', err);
    res.status(500).json({ message: 'Server error in gas simulator' });
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
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('➡️ Make sure your current IP address is whitelisted in MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/');
    console.error('➡️ Also check your MONGO_URI in .env and network connectivity.');
  });
