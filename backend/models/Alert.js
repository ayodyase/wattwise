const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true
  },
  floorNumber: {
    type: Number,
    default: 1
  },
  predictedWh: {
    type: Number,
    required: true
  },
  thresholdWh: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    enum: ['Medium', 'High', 'Critical'],
    default: 'High'
  },
  status: {
    type: String,
    enum: ['Active', 'Acknowledged', 'Resolved'],
    default: 'Active'
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Alert', alertSchema);
