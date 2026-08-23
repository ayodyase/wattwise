const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Models for seed initialization
const User = require('./models/User');
const Announcement = require('./models/Announcement');

// Load environment variables from root .env or backend .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Body Parser & CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect Database
connectDB();

// Seed initial default admin and regular user accounts (Local dev / standalone server)
const seedDefaultAccounts = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@wattwise.lk' });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@wattwise.lk',
        password: 'Admin@123456',
        role: 'admin',
        city: 'Colombo'
      });
      console.log("Seeded default Admin account (admin@wattwise.lk / Admin@123456)");
    }

    const demoUserExists = await User.findOne({ email: 'user@wattwise.lk' });
    if (!demoUserExists) {
      await User.create({
        name: 'Household Demo User',
        email: 'user@wattwise.lk',
        password: 'User@123456',
        role: 'user',
        city: 'Kandy'
      });
      console.log("Seeded default Demo User account (user@wattwise.lk / User@123456)");
    }

    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      await Announcement.create({
        title: 'Ceylon Electricity Board (CEB) Revised Tariff Rates Active',
        message: 'The system has been updated with Sri Lanka 2024 residential electricity tariff slabs. Energy consumption predictions now reflect instant LKR cost estimates.',
        badge: 'Tariff Update'
      });
    }
  } catch (err) {
    console.warn("Account seed notice:", err.message);
  }
};

if (!process.env.VERCEL) {
  setTimeout(seedDefaultAccounts, 2000);
}

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/predict', require('./routes/predictRoutes'));
app.use('/api/bill', require('./routes/billRoutes'));
app.use('/api/tips', require('./routes/tipsRoutes'));
app.use('/api/buildings', require('./routes/buildingRoutes'));
app.use('/api/analyst', require('./routes/analystRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'WattWise MERN Express Backend',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start local server if run directly
const PORT = process.env.PORT || 5000;
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`WattWise Backend Express Server running on port ${PORT}`);
  });
}

module.exports = app;

