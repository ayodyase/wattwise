const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.warn("WARNING: MONGODB_URI not found in environment variables. Falling back to local MongoDB...");
    }
    const targetUri = connStr || 'mongodb://127.0.0.1:27017/wattwise';
    
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Non-fatal fallback for development offline mode
    console.warn("Continuing server initialization with fallback mode...");
  }
};

module.exports = connectDB;

