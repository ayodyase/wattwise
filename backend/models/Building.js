const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['House', 'Apartment', 'Office', 'Commercial'],
    default: 'House'
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  floorsCount: {
    type: Number,
    default: 1
  },
  unitsCount: {
    type: Number,
    default: 1
  },
  location: {
    type: String,
    default: 'Colombo, Sri Lanka'
  },
  alertThresholdWh: {
    type: Number,
    default: 400
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Building', buildingSchema);
