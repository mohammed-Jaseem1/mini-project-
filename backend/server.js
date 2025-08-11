require('dotenv').config(); // Load env variables at the top

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');

const app = express();
app.use(cors());
app.use(express.json());

// Use your Atlas connection string from env
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas - IotDB'))
.catch(err => console.error('❌ MongoDB Atlas Connection Error:', err));

app.use('/api/register', registerRoute);
app.use('/api/login', loginRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
