// backend/createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config()

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  if (!MONGO_URI) {
    console.error("Set MONGO_URI in .env");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  const email = "admin@example.com";
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists:", email);
    return mongoose.connection.close();
  }

  const hashed = await bcrypt.hash("123456", 10);
  const admin = new User({
    fullName: "Admin User",
    email,
    password: hashed,
    role: "admin"
  });

  await admin.save();
  console.log("Admin created:", email);
  await mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
