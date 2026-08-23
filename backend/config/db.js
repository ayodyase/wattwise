const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const connStr = process.env.MONGODB_URI;
  if (!connStr) {
    throw new Error("MONGODB_URI is missing in environment variables. Please add it to your Vercel project settings.");
  }

  try {
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 8000
    });
    isConnected = mongoose.connection.readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default accounts if needed
    try {
      const User = require('../models/User');
      const adminExists = await User.findOne({ email: 'admin@wattwise.lk' });
      if (!adminExists) {
        await User.create({
          name: 'System Administrator',
          email: 'admin@wattwise.lk',
          password: 'Admin@123456',
          role: 'admin',
          city: 'Colombo'
        });
      }
      const demoExists = await User.findOne({ email: 'user@wattwise.lk' });
      if (!demoExists) {
        await User.create({
          name: 'Household Demo User',
          email: 'user@wattwise.lk',
          password: 'User@123456',
          role: 'user',
          city: 'Kandy'
        });
      }
    } catch (seedErr) {
      console.warn("Auto-seed notice:", seedErr.message);
    }
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;


