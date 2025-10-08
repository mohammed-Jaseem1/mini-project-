// backend/scripts/getUserIds.js
// Script to get existing user IDs from the database

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function getUserIds() {
  if (!MONGO_URI) {
    console.error("❌ Set MONGO_URI in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all users
    const users = await User.find().select('_id fullName email role createdAt');
    
    if (users.length === 0) {
      console.log("❌ No users found in database");
      console.log("💡 Run 'node scripts/createAdmin.js' to create an admin user first");
      return;
    }

    console.log(`📊 Found ${users.length} user(s):`);
    console.log("=" .repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user._id}`);
      console.log(`   Name: ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log("-".repeat(50));
    });

    console.log(`\n🔧 For ESP32 configuration, use one of these User IDs:`);
    console.log(`String userId = "${users[0]._id}"; // ${users[0].fullName}`);
    
    if (users.length > 1) {
      console.log(`// Or use: String userId = "${users[1]._id}"; // ${users[1].fullName}`);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

getUserIds();