const express = require('express');
const router = express.Router();
const Tip = require('../models/Tip');
const { protect, authorize } = require('../middleware/auth');

// Seed default tips if collection is empty
const seedDefaultTips = async () => {
  const count = await Tip.countDocuments();
  if (count === 0) {
    await Tip.insertMany([
      {
        title: 'Optimize Air Conditioner Temperature Settings',
        content: 'Setting your AC temperature to 25°C or 26°C instead of 18°C–20°C reduces compressor load significantly. Every degree higher saves ~6% on electricity bills.',
        usageLevel: 'High',
        appliance: 'AC / Cooling',
        potentialSavingsPercent: 20
      },
      {
        title: 'Unplug Standby Appliance Chargers',
        content: 'Televisions, microwave ovens, and phone chargers continue consuming vampire power when plugged in. Use smart power strips to isolate load.',
        usageLevel: 'All',
        appliance: 'Electronics',
        potentialSavingsPercent: 8
      },
      {
        title: 'Upgrade to High-Efficacy LED Lighting',
        content: 'Replace conventional 60W incandescent or CFL tubes with 9W 120 lm/W LED lights. LEDs produce equal illumination while consuming 80% less energy.',
        usageLevel: 'Normal',
        appliance: 'Lighting',
        potentialSavingsPercent: 15
      },
      {
        title: 'Refrigerator Defrost & Gasket Seal Inspection',
        content: 'Clean refrigerator coils twice annually and verify door rubber gasket seal integrity. Faulty seals force compressor unit to run continuously.',
        usageLevel: 'Very High',
        appliance: 'Refrigerator',
        potentialSavingsPercent: 18
      },
      {
        title: 'Install Water Heater Solar Pre-Heaters or Timers',
        content: 'Water heaters account for up to 30% of peak evening energy spikes. Install timer switches to run only 30 minutes before usage.',
        usageLevel: 'Very High',
        appliance: 'Water Heater',
        potentialSavingsPercent: 25
      }
    ]);
  }
};

// @route GET /api/tips
router.get('/', async (req, res) => {
  try {
    await seedDefaultTips();
    const { usageLevel, appliance } = req.query;

    let query = {};
    if (usageLevel && usageLevel !== 'All') {
      query.usageLevel = { $in: [usageLevel, 'All'] };
    }
    if (appliance && appliance !== 'All') {
      query.appliance = appliance;
    }

    const tips = await Tip.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tips.length,
      tips
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route POST /api/tips (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, content, usageLevel, appliance, potentialSavingsPercent } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const tip = await Tip.create({
      title,
      content,
      usageLevel: usageLevel || 'All',
      appliance: appliance || 'General',
      potentialSavingsPercent: potentialSavingsPercent || 10,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, tip });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route PUT /api/tips/:id (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const tip = await Tip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tip) {
      return res.status(404).json({ success: false, error: 'Tip not found' });
    }
    res.status(200).json({ success: true, tip });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route DELETE /api/tips/:id (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ success: false, error: 'Tip not found' });
    }
    await tip.deleteOne();
    res.status(200).json({ success: true, message: 'Tip deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
