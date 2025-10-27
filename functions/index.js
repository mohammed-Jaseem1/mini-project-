// functions/index.js

// CHANGE 1: We must import the 'firebase-functions' library
const functions = require("firebase-functions");

// --- Your original imports (they stay the same) ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// --- Your original route imports (they stay the same) ---
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const newconnectionRoute = require('./routes/newconnection');
const paymentRoute = require('./routes/payment');
const gasLevelRoute = require('./routes/gaslevel');
const autoBookingRoute = require('./routes/autobooking');
const simulationRoute = require('./routes/simulation');
const historyRoute = require('./routes/history');
const myFeedbackRoutes = require('./routes/myfeedback');

const app = express();

// --- Middleware Setup ---
// CHANGE 2: Use cors with origin set to true for Firebase Functions
app.use(cors({ origin: true }));
app.use(express.json());

// --- Your original API Routes (they stay the same) ---
app.use('/api/login', loginRoute);
app.use('/api/register', registerRoute);
app.use('/api/newconnection', newconnectionRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/gaslevel', gasLevelRoute);
app.use('/api/autobooking', autoBookingRoute);
app.use('/api/simulation', simulationRoute);
app.use('/api/history', historyRoute);
app.use('/api/myfeedback', myFeedbackRoutes);

// --- Your original Health Check Route (it stays the same) ---
app.get('/', (req, res) => res.send('API is running successfully!'));

// --- MongoDB Connection ---
// CHANGE 3: We get the connection string from Firebase's environment config, NOT a .env file.
const MONGO_URI = functions.config().mongodb.uri;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ ✅ ✅  Backend connected to MongoDB successfully!');
  })
  .catch(err => {
    console.error('❌ ❌ ❌  MongoDB connection error:', err.message);
  });


// CHANGE 4: DELETE the app.listen() block. Firebase handles this automatically.
// app.listen(PORT, () => console.log(`🚀 🚀 🚀  Server is running on port ${PORT}`));


// CHANGE 5: EXPORT your Express app as a single Cloud Function called 'api'.
// This is the most important change. It tells Firebase how to run your server code.
exports.api = functions.https.onRequest(app);