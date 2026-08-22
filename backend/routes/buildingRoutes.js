const express = require('express');
const router = express.Router();
const Building = require('../models/Building');
const Alert = require('../models/Alert');
const Prediction = require('../models/Prediction');
const { protect, authorize } = require('../middleware/auth');

// @route GET /api/buildings
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.managerId = req.user._id;
    }
    const buildings = await Building.find(query).populate('managerId', 'name email');
    res.status(200).json({ success: true, buildings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route POST /api/buildings (Admin or user creating building)
router.post('/', protect, async (req, res) => {
  try {
    const { name, type, floorsCount, unitsCount, location, alertThresholdWh } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Building name is required' });
    }

    const building = await Building.create({
      name,
      type: type || 'House',
      managerId: req.user._id,
      floorsCount: floorsCount || 1,
      unitsCount: unitsCount || 1,
      location: location || 'Colombo, Sri Lanka',
      alertThresholdWh: alertThresholdWh || 400
    });

    res.status(201).json({ success: true, building });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route GET /api/buildings/:id/dashboard-stats
router.get('/:id/dashboard-stats', protect, async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ success: false, error: 'Building not found' });
    }

    const alerts = await Alert.find({ buildingId: building._id }).sort({ createdAt: -1 }).limit(10);
    const predictions = await Prediction.find({ buildingId: building._id }).sort({ createdAt: -1 }).limit(50);

    const totalPredictedWhToday = predictions.reduce((acc, curr) => acc + curr.predictedWh, 0);
    const avgWh = predictions.length > 0 ? Math.round(totalPredictedWhToday / predictions.length) : 0;
    const estimatedDailyCostLKR = Math.round(totalPredictedWhToday * 0.0275 * 100) / 100;

    res.status(200).json({
      success: true,
      building,
      totalPredictedWhToday,
      avgWh,
      estimatedDailyCostLKR,
      alertsCount: alerts.length,
      alerts,
      recentPredictions: predictions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route GET /api/buildings/alerts
router.get('/alerts/active', protect, async (req, res) => {
  try {
    const alerts = await Alert.find().populate('buildingId', 'name location').sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
