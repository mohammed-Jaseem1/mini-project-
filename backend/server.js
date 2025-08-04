// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/lpg_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Import and use route
app.use('/api/register', require('./routes/register')); // ✅ Correct path

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
app.get('/api/ping', async (req, res) => {
  try {
    // Try to list all collections — simple query to test connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ message: 'MongoDB is connected!', collections });
  } catch (error) {
    res.status(500).json({ error: 'MongoDB not connected' });
  }
});
