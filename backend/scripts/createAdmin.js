const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";
    
    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Updating existing admin password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await Admin.updateOne(
        { email: adminEmail },
        { $set: { password: hashedPassword }}
      );
      console.log('Admin password updated successfully');
    } else {
      // Create new admin
      console.log('Creating new admin...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      const admin = new Admin({
        email: adminEmail,
        password: hashedPassword
      });
      await admin.save();
      console.log('Admin created successfully');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();
