const express = require('express');
const router = express.Router();
const TariffConfig = require('../models/TariffConfig');

// Helper function to calculate CEB residential tariff slabs (2024)
async function calculateCEBBill(monthlyKWh) {
  const units = Math.max(0, parseFloat(monthlyKWh) || 0);
  
  let config = await TariffConfig.findOne({ isActive: true });
  if (!config) {
    config = await TariffConfig.create({
      name: 'CEB Residential Current',
      slabs: [
        { limit: 30, rate: 2.50, fixedCharge: 180, label: '0 - 30 units' },
        { limit: 60, rate: 4.85, fixedCharge: 240, label: '31 - 60 units' },
        { limit: 90, rate: 7.85, fixedCharge: 360, label: '61 - 90 units' },
        { limit: 120, rate: 10.00, fixedCharge: 960, label: '91 - 120 units' },
        { limit: 180, rate: 27.75, fixedCharge: 1500, label: '121 - 180 units' },
        { limit: 999999, rate: 45.00, fixedCharge: 2000, label: '181+ units' }
      ],
      fuelSurchargePercent: 0.0,
      averageRatePerKWh: 27.50
    });
  }
  
  let energyCharge = 0;
  let fixedCharge = 0;
  const breakdown = [];

  let highestTierIndex = 0;
  for (let i = 0; i < config.slabs.length; i++) {
    if (units <= config.slabs[i].limit) {
      highestTierIndex = i;
      break;
    }
  }

  fixedCharge = config.slabs[highestTierIndex].fixedCharge;
  let remainingUnits = units;
  let previousLimit = 0;

  for (let i = 0; i <= highestTierIndex; i++) {
    const slab = config.slabs[i];
    const tierSize = i === highestTierIndex 
      ? remainingUnits 
      : (slab.limit - previousLimit);
      
    if (tierSize > 0) {
      const cost = tierSize * slab.rate;
      energyCharge += cost;
      breakdown.push({
        slab: slab.label,
        units: tierSize,
        rate: slab.rate,
        cost: cost
      });
      remainingUnits -= tierSize;
    }
    previousLimit = slab.limit;
  }

  const fuelSurchargePercent = config.fuelSurchargePercent || 0.0;
  const fuelSurcharge = (energyCharge * fuelSurchargePercent) / 100.0;
  const totalBillLKR = energyCharge + fixedCharge + fuelSurcharge;

  let savingsTips = [];
  if (units > 180) {
    savingsTips.push("Your consumption crosses the 181+ unit slab (Rs. 45.00/unit). Reducing usage by 15 kWh can save up to Rs. 1,200 monthly!");
    savingsTips.push("Invertor AC units set to 26°C instead of 20°C reduce energy consumption by up to 25%.");
  } else if (units > 90) {
    savingsTips.push("Shift heavy appliance usage (washing machine, iron) away from peak evening hours (6:30 PM - 9:30 PM).");
    savingsTips.push("Replace halogen bulbs with 9W LED lamps for an instant 80% lighting power reduction.");
  } else {
    savingsTips.push("Great job! Your consumption remains within economical lower tariff slabs.");
  }

  return {
    monthlyKWh: units,
    energyCharge: Math.round(energyCharge * 100) / 100,
    fixedCharge,
    fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
    totalBillLKR: Math.round(totalBillLKR * 100) / 100,
    breakdown,
    savingsTips
  };
}

const { validateBillInput } = require('../middleware/validate');

// @route POST /api/bill/calculate
router.post('/calculate', validateBillInput, async (req, res) => {
  try {
    const { monthlyKWh, hourlyWh } = req.body;
    let units = parseFloat(monthlyKWh);

    if (isNaN(units) && hourlyWh) {
      units = (parseFloat(hourlyWh) * 24 * 30) / 1000.0;
    }

    if (isNaN(units)) {
      return res.status(400).json({ success: false, error: 'Please provide valid monthlyKWh or hourlyWh' });
    }

    const result = await calculateCEBBill(units);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
module.exports.calculateCEBBill = calculateCEBBill;
