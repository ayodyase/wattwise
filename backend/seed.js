const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Prediction = require('./models/Prediction');
const Building = require('./models/Building');
const Tip = require('./models/Tip');
const Alert = require('./models/Alert');
const Announcement = require('./models/Announcement');
const AuditLog = require('./models/AuditLog');

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wattwise';
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(connStr);
    console.log("Connected successfully!");

    // 1. Seed Users
    console.log("Seeding User Accounts...");
    let admin = await User.findOne({ email: 'admin@wattwise.lk' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@wattwise.lk',
        password: 'Admin@123456',
        role: 'admin',
        city: 'Colombo',
        phone: '+94 77 123 4567'
      });
    }

    let user = await User.findOne({ email: 'user@wattwise.lk' });
    if (!user) {
      user = await User.create({
        name: 'Household Demo User',
        email: 'user@wattwise.lk',
        password: 'User@123456',
        role: 'user',
        city: 'Kandy',
        phone: '+94 71 987 6543'
      });
    }

    // 2. Seed Buildings
    console.log("Seeding Building Properties...");
    let b1 = await Building.findOne({ name: 'Orion Green Tech Complex' });
    if (!b1) {
      b1 = await Building.create({
        name: 'Orion Green Tech Complex',
        type: 'Office',
        managerId: admin._id,
        floorsCount: 6,
        unitsCount: 24,
        location: 'Colombo 02, Sri Lanka',
        alertThresholdWh: 500
      });
    }

    let b2 = await Building.findOne({ name: 'Lotus Residencies' });
    if (!b2) {
      b2 = await Building.create({
        name: 'Lotus Residencies',
        type: 'Apartment',
        managerId: admin._id,
        floorsCount: 10,
        unitsCount: 40,
        location: 'Rajagiriya, Sri Lanka',
        alertThresholdWh: 380
      });
    }

    let b3 = await Building.findOne({ name: 'Kandy Smart Eco Villa' });
    if (!b3) {
      b3 = await Building.create({
        name: 'Kandy Smart Eco Villa',
        type: 'House',
        managerId: admin._id,
        floorsCount: 2,
        unitsCount: 1,
        location: 'Kandy, Sri Lanka',
        alertThresholdWh: 300
      });
    }

    // 3. Seed Predictions History (30+ varied records over the past 30 days)
    console.log("Seeding Predictions History...");
    const existingPredsCount = await Prediction.countDocuments();
    if (existingPredsCount < 10) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const buildingTypes = ['House', 'Apartment', 'Office'];
      const buildingsList = [b3._id, b2._id, b1._id];

      const samplePredictions = [];
      const now = new Date();

      for (let i = 25; i >= 0; i--) {
        const recordDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000) - (Math.random() * 8 * 3600 * 1000));
        const hour = Math.floor(Math.random() * 24);
        const dayName = days[recordDate.getDay()];
        const indoorTemp = Math.round((21 + Math.random() * 5) * 10) / 10;
        const outdoorTemp = Math.round((26 + Math.random() * 6) * 10) / 10;
        const appliancesActive = Math.floor(1 + Math.random() * 5);
        const occupants = Math.floor(2 + Math.random() * 4);
        
        // Compute realistic Wh
        const isPeak = (hour >= 18 && hour <= 21);
        const baseWh = 60 + (indoorTemp * 2) + (appliancesActive * 38) + (occupants * 15) + (isPeak ? 65 : 0);
        const predictedWh = Math.round(baseWh + (Math.random() * 20 - 10));
        
        let category = 'Normal';
        if (predictedWh < 80) category = 'Low';
        else if (predictedWh <= 180) category = 'Normal';
        else if (predictedWh <= 350) category = 'High';
        else category = 'Very High';

        const bldgIdx = i % 3;

        samplePredictions.push({
          userId: user._id,
          buildingId: buildingsList[bldgIdx],
          indoorTemp,
          outdoorTemp,
          indoorHumidity: 58 + Math.floor(Math.random() * 20),
          outdoorHumidity: 68 + Math.floor(Math.random() * 25),
          occupants,
          appliancesActive,
          hour,
          dayOfWeek: dayName,
          buildingType: buildingTypes[bldgIdx],
          predictedWh,
          lightsWh: Math.round(predictedWh * 0.12),
          usageCategory: category,
          estimatedCostLKR: Math.round(predictedWh * 0.0275 * 100) / 100,
          createdAt: recordDate
        });
      }

      await Prediction.insertMany(samplePredictions);
      console.log(`Inserted ${samplePredictions.length} historical prediction records!`);
    }

    // 4. Seed Energy Saving Tips
    console.log("Seeding Energy Saving Tips...");
    await Tip.deleteMany({});
    await Tip.insertMany([
      {
        title: 'Optimize Air Conditioner Temperature Settings',
        content: 'Setting your AC temperature to 25°C or 26°C instead of 18°C–20°C reduces compressor load significantly. Every degree higher saves ~6% on electricity bills in Sri Lanka tropical climates.',
        usageLevel: 'High',
        appliance: 'AC / Cooling',
        potentialSavingsPercent: 22,
        createdBy: admin._id
      },
      {
        title: 'Unplug Standby & Vampire Power Appliances',
        content: 'Televisions, microwave ovens, audio systems, and phone chargers continue drawing standby electricity 24/7. Using master switch power strips eliminates vampire power waste.',
        usageLevel: 'All',
        appliance: 'Electronics',
        potentialSavingsPercent: 10,
        createdBy: admin._id
      },
      {
        title: 'Switch to High-Efficacy LED Lighting',
        content: 'Replace conventional 60W incandescent bulbs and fluorescent tubes with 9W 120 lm/W LED lamps. LEDs produce equal lumen output with 80% less power consumption.',
        usageLevel: 'Normal',
        appliance: 'Lighting',
        potentialSavingsPercent: 18,
        createdBy: admin._id
      },
      {
        title: 'Refrigerator Coil Cleaning & Door Seal Check',
        content: 'Dust refrigerator condenser coils twice annually and inspect the rubber gasket seal with the paper test. Proper ventilation around the fridge improves cooling efficiency by 15%.',
        usageLevel: 'Very High',
        appliance: 'Refrigerator',
        potentialSavingsPercent: 15,
        createdBy: admin._id
      },
      {
        title: 'Install Water Heater Solar Pre-Heater / Smart Timer',
        content: 'Electric water heaters draw 2,000W–3,000W during peak evening tariff hours (6:30 PM - 9:30 PM). Install a 30-minute digital timer switch or solar thermal collector.',
        usageLevel: 'Very High',
        appliance: 'Water Heater',
        potentialSavingsPercent: 28,
        createdBy: admin._id
      },
      {
        title: 'Shift Heavy Laundry Cycles to Off-Peak Morning Hours',
        content: 'Run washing machines and electric irons during morning or early afternoon hours rather than evening hours to balance household load and prevent power grid stress.',
        usageLevel: 'Normal',
        appliance: 'General',
        potentialSavingsPercent: 12,
        createdBy: admin._id
      }
    ]);

    // 5. Seed Announcements
    console.log("Seeding System Announcements...");
    await Announcement.deleteMany({});
    await Announcement.create({
      title: 'Ceylon Electricity Board (CEB) Revised Residential Tariff Active',
      message: 'The system has been updated with the 2024 Sri Lanka CEB residential tariff slabs (Rs. 2.50 to Rs. 45.00/unit). Predictions now display instant itemized slab bill costs.',
      badge: 'Tariff Update',
      createdBy: admin._id
    });

    // 6. Seed Alerts
    console.log("Seeding Building Alerts...");
    const existingAlerts = await Alert.countDocuments();
    if (existingAlerts === 0) {
      await Alert.create({
        buildingId: b1._id,
        floorNumber: 3,
        predictedWh: 540,
        thresholdWh: 500,
        severity: 'High',
        message: 'Floor 3 HVAC load peak detected (540 Wh exceeds 500 Wh threshold)'
      });
    }

    console.log("\n=======================================================");
    console.log("✅ SEEDING COMPLETE!");
    console.log("Default Admin: admin@wattwise.lk / Admin@123456");
    console.log("Default User : user@wattwise.lk  / User@123456");
    console.log("=======================================================\n");

    process.exit(0);

  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
