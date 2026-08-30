const mongoose = require('mongoose');

const tariffConfigSchema = new mongoose.Schema({
  name: { type: String, default: 'CEB Residential Current' },
  slabs: [
    {
      limit: { type: Number, required: true }, // Max units for this tier (e.g., 30, 60, 90, 120, 180, 999999).
      rate: { type: Number, required: true },
      fixedCharge: { type: Number, required: true },
      label: { type: String, required: true }
    }
  ],
  fuelSurchargePercent: { type: Number, default: 0.0 },
  averageRatePerKWh: { type: Number, default: 27.50 }, // For simple estimations in ML fallback
  isActive: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('TariffConfig', tariffConfigSchema);
