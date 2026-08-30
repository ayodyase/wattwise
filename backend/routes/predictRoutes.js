const express = require('express');
const router = express.Router();
const axios = require('axios');
const Prediction = require('../models/Prediction');
const Building = require('../models/Building');
const Alert = require('../models/Alert');
const TariffConfig = require('../models/TariffConfig');
const { protect } = require('../middleware/auth');
const { validatePredictionInput } = require('../middleware/validate');

const FLASK_ML_URL = process.env.FLASK_ML_URL || 'http://127.0.0.1:5001';

// @route POST /api/predict
router.post('/', protect, validatePredictionInput, async (req, res) => {
  try {
    const {
      indoorTemp,
      outdoorTemp,
      indoorHumidity,
      outdoorHumidity,
      occupants,
      appliancesActive,
      hour,
      dayOfWeek,
      buildingType,
      buildingId,
      prevHourUsage
    } = req.body;

    let mlResult;

    // Call Python Flask ML microservice
    try {
      const flaskRes = await axios.post(`${FLASK_ML_URL}/predict`, {
        indoorTemp: indoorTemp || 22.0,
        outdoorTemp: outdoorTemp || 28.0,
        indoorHumidity: indoorHumidity || 60.0,
        outdoorHumidity: outdoorHumidity || 75.0,
        occupants: occupants || 3,
        appliancesActive: appliancesActive || 2,
        hour: hour !== undefined ? hour : new Date().getHours(),
        dayOfWeek: dayOfWeek || 'Monday',
        prevHourUsage: prevHourUsage || 100.0,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role
      }, { timeout: 4000 });

      mlResult = flaskRes.data;
    } catch (flaskErr) {
      console.warn("Flask ML Microservice offline or unreachable. Using fallback Random Forest formula logic:", flaskErr.message);
      // Fallback prediction calculation logic matching RF regression model curve
      const baseWh = 60.0 + (parseFloat(indoorTemp || 22) * 1.8) + (parseInt(appliancesActive || 2) * 35.0) + (parseInt(occupants || 3) * 12.0);
      const isNight = (hour >= 18 || hour <= 6) ? 1 : 0;
      const predictedWh = Math.round(baseWh + (isNight * 20.0));
      
      let category = 'Normal';
      if (predictedWh < 80) category = 'Low';
      else if (predictedWh <= 180) category = 'Normal';
      else if (predictedWh <= 350) category = 'High';
      else category = 'Very High';

      let config = await TariffConfig.findOne({ isActive: true });
      const avgRatePerKWh = config ? (config.averageRatePerKWh || 27.50) : 27.50;
      const ratePerWh = avgRatePerKWh / 1000.0;

      mlResult = {
        success: true,
        predictedWh,
        lightsWh: Math.round(predictedWh * 0.12),
        usageCategory: category,
        estimatedCostLKR: Math.round(predictedWh * ratePerWh * 100) / 100
      };
    }

    const dayString = dayOfWeek || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

    // Print Telemetry with User & Role Details to Backend CMD
    console.log('\n======================================================');
    console.log('⚡ [WATTWISE PREDICTION EVENT]');
    console.log(`👤 User: ${req.user.name} (${req.user.email})`);
    console.log(`🛡️  Role: ${req.user.role ? req.user.role.toUpperCase() : 'USER'}`);
    console.log(`🏠 Property: ${buildingType || 'House'} | Hour: ${hour !== undefined ? hour : new Date().getHours()}:00 (${dayString})`);
    console.log(`🌡️  Inputs: Indoor ${indoorTemp || 22.0}°C (${indoorHumidity || 60}%) | Outdoor ${outdoorTemp || 28.0}°C (${outdoorHumidity || 75}%)`);
    console.log(`👥 Occupants: ${occupants || 3} | Active Appliances: ${appliancesActive || 2}`);
    console.log(`💡 ML Forecast: ${mlResult.predictedWh} Wh (${mlResult.usageCategory} Load) | Lights: ${mlResult.lightsWh || Math.round(mlResult.predictedWh * 0.12)} Wh`);
    console.log(`💰 Est. Cost: Rs. ${mlResult.estimatedCostLKR} LKR (Monthly: ~${((mlResult.predictedWh * 24 * 30) / 1000).toFixed(1)} kWh)`);
    console.log(`🕒 Timestamp: ${new Date().toLocaleString()}`);
    console.log('======================================================\n');

    // Save prediction record in MongoDB
    const newPrediction = await Prediction.create({
      userId: req.user._id,
      buildingId: buildingId || null,
      indoorTemp: indoorTemp || 22.0,
      outdoorTemp: outdoorTemp || 28.0,
      indoorHumidity: indoorHumidity || 60.0,
      outdoorHumidity: outdoorHumidity || 75.0,
      occupants: occupants || 3,
      appliancesActive: appliancesActive || 2,
      hour: hour !== undefined ? hour : new Date().getHours(),
      dayOfWeek: dayString,
      buildingType: buildingType || 'House',
      predictedWh: mlResult.predictedWh,
      lightsWh: mlResult.lightsWh || Math.round(mlResult.predictedWh * 0.12),
      usageCategory: mlResult.usageCategory,
      estimatedCostLKR: mlResult.estimatedCostLKR
    });

    // Check building threshold alerts if buildingId provided
    if (buildingId) {
      const bldg = await Building.findById(buildingId);
      if (bldg && mlResult.predictedWh > bldg.alertThresholdWh) {
        await Alert.create({
          buildingId: bldg._id,
          floorNumber: 1,
          predictedWh: mlResult.predictedWh,
          thresholdWh: bldg.alertThresholdWh,
          severity: mlResult.predictedWh > (bldg.alertThresholdWh * 1.5) ? 'Critical' : 'High',
          message: `Energy consumption peak detected: ${mlResult.predictedWh} Wh exceeds threshold of ${bldg.alertThresholdWh} Wh`
        });
      }
    }

    res.status(200).json({
      success: true,
      prediction: newPrediction
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route GET /api/predict/history
router.get('/history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    const total = await Prediction.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      predictions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route DELETE /api/predict/history/:id
router.delete('/history/:id', protect, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({ success: false, error: 'Prediction record not found' });
    }

    if (prediction.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this record' });
    }

    await prediction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Prediction record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route POST /api/predict/bulk
router.post('/bulk', protect, async (req, res) => {
  try {
    const { rows } = req.body;
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ success: false, error: 'Rows array is required' });
    }

    let bulkResults = [];
    try {
      const flaskRes = await axios.post(`${FLASK_ML_URL}/predict-bulk`, { rows }, { timeout: 8000 });
      bulkResults = flaskRes.data.predictions;
    } catch (err) {
      console.warn("Flask bulk prediction fallback:", err.message);
      bulkResults = rows.map((r, i) => {
        const wh = 70.0 + (parseFloat(r.indoorTemp || 22) * 1.5) + (parseInt(r.appliancesActive || 2) * 30.0);
        return {
          rowId: i + 1,
          indoorTemp: r.indoorTemp || 22,
          outdoorTemp: r.outdoorTemp || 28,
          hour: r.hour || 14,
          predictedWh: Math.round(wh),
          usageCategory: wh > 180 ? 'High' : 'Normal',
          estimatedCostLKR: Math.round(wh * 0.0275 * 100) / 100
        };
      });
    }

    res.status(200).json({
      success: true,
      totalRows: bulkResults.length,
      predictions: bulkResults
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
