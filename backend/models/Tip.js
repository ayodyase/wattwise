const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  usageLevel: {
    type: String,
    enum: ['All', 'Low', 'Normal', 'High', 'Very High'],
    default: 'All'
  },
  appliance: {
    type: String,
    enum: ['General', 'AC / Cooling', 'Refrigerator', 'Lighting', 'Water Heater', 'Electronics'],
    default: 'General'
  },
  potentialSavingsPercent: {
    type: Number,
    default: 10
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tip', tipSchema);
