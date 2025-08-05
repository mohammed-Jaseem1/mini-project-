const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ✅ Import registration route
const registerRoute = require('./routes/register');
const User = require('./models/User'); // model needed for login

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect('mongodb+srv://jaseem:ObjoFA175TulCAn5@cluster0.jajw7cw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
  });

// ✅ Use the register route
app.use('/api/register', registerRoute); // ✅ This is correct!

// ✅ Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ message: "User not found" });
    }

    if (existingUser.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({ message: "Login successful" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Start the server
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});
