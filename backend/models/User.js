// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone:    { type: String, required: true }, // <-- ADD THIS LINE
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["admin","user"], default: "user" }
}, { timestamps: true });

// This line is good practice to prevent recompiling the model in some environments
module.exports = mongoose.models.User || mongoose.model("User", userSchema);