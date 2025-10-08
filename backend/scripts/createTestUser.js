// backend/scripts/createTestUser.js
// Script to create a test user for ESP32 gas monitoring

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function createTestUser() {
  if (!MONGO_URI) {
    console.error("❌ Set MONGO_URI in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = "esp32test@gasmonitor.com";
    const phone = "1234567890";
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("✅ Test user already exists:");
      console.log(`   User ID: ${existingUser._id}`);
      console.log(`   Name: ${existingUser.fullName}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`\n🔧 Use this in ESP32 code:`);
      console.log(`String userId = "${existingUser._id}";`);
      return;
    }

    // Create new test user
    const hashedPassword = await bcrypt.hash("testpass123", 10);
    const testUser = new User({
      fullName: "ESP32 Test User",
      phone: phone,
      email: email,
      password: hashedPassword,
      role: "user"
    });

    await testUser.save();
    
    console.log("🎉 Test user created successfully:");
    console.log(`   User ID: ${testUser._id}`);
    console.log(`   Name: ${testUser.fullName}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Phone: ${testUser.phone}`);
    console.log(`   Role: ${testUser.role}`);
    
    console.log(`\n🔧 Copy this line to your ESP32 code (main.cpp):`);
    console.log(`String userId = "${testUser._id}";`);

  } catch (error) {
    console.error("❌ Error creating test user:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

createTestUser();