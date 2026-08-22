const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    default: null
  },
  indoorTemp: {
    type: Number,
    required: true
  },
  outdoorTemp: {
    type: Number,
    default: 28.0
  },
  indoorHumidity: {
    type: Number,
    default: 65.0
  },
  outdoorHumidity: {
    type: Number,
    default: 75.0
  },
  occupants: {
    type: Number,
    default: 3
  },
  appliancesActive: {
    type: Number,
    default: 2
  },
  hour: {
    type: Number,
    required: true
  },
  dayOfWeek: {
    type: String,
    required: true
  },
  buildingType: {
    type: String,
    enum: ['House', 'Apartment', 'Office', 'Commercial'],
    default: 'House'
  },
  predictedWh: {
    type: Number,
    required: true
  },
  lightsWh: {
    type: Number,
    default: 0
  },
  usageCategory: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Very High'],
    required: true
  },
  estimatedCostLKR: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prediction', predictionSchema);
