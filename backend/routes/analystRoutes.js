const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const Building = require('../models/Building');
const { protect, authorize } = require('../middleware/auth');

// @route GET /api/analyst/aggregate-stats (Admin / Analyst)
router.get('/aggregate-stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalPredictions = await Prediction.countDocuments();
    const totalBuildings = await Building.countDocuments();

    // Average Wh by Building Type
    const buildingTypeStats = await Prediction.aggregate([
      {
        $group: {
          _id: '$buildingType',
          avgWh: { $avg: '$predictedWh' },
          maxWh: { $max: '$predictedWh' },
          totalCost: { $sum: '$estimatedCostLKR' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Average Wh by Hour of Day (Peak Energy Hours)
    const hourlyStats = await Prediction.aggregate([
      {
        $group: {
          _id: '$hour',
          avgWh: { $avg: '$predictedWh' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Usage Category Distribution
    const categoryStats = await Prediction.aggregate([
      {
        $group: {
          _id: '$usageCategory',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      totalPredictions,
      totalBuildings,
      buildingTypeStats,
      hourlyStats,
      categoryStats
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route POST /api/analyst/query (Custom Dataset Filtering)
router.post('/query', protect, authorize('admin'), async (req, res) => {
  try {
    const { buildingType, minWh, maxWh, usageCategory, hourStart, hourEnd } = req.body;

    let query = {};
    if (buildingType && buildingType !== 'All') query.buildingType = buildingType;
    if (usageCategory && usageCategory !== 'All') query.usageCategory = usageCategory;

    if (minWh || maxWh) {
      query.predictedWh = {};
      if (minWh) query.predictedWh.$gte = parseFloat(minWh);
      if (maxWh) query.predictedWh.$lte = parseFloat(maxWh);
    }

    if (hourStart !== undefined && hourEnd !== undefined) {
      query.hour = { $gte: parseInt(hourStart), $lte: parseInt(hourEnd) };
    }

    const records = await Prediction.find(query)
      .select('buildingType hour dayOfWeek predictedWh lightsWh usageCategory estimatedCostLKR createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    const totalMatching = await Prediction.countDocuments(query);

    res.status(200).json({
      success: true,
      totalMatching,
      records
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
