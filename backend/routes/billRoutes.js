const express = require('express');
const router = express.Router();

// Helper function to calculate CEB residential tariff slabs (2024)
function calculateCEBBill(monthlyKWh) {
  const units = Math.max(0, parseFloat(monthlyKWh) || 0);
  
  let energyCharge = 0;
  let fixedCharge = 0;
  const breakdown = [];

  if (units <= 30) {
    const cost = units * 2.50;
    energyCharge += cost;
    fixedCharge = 180;
    breakdown.push({ slab: '0 - 30 units', units, rate: 2.50, cost });
  } else if (units <= 60) {
    const cost1 = 30 * 2.50;
    const cost2 = (units - 30) * 4.85;
    energyCharge = cost1 + cost2;
    fixedCharge = 240;
    breakdown.push({ slab: '0 - 30 units', units: 30, rate: 2.50, cost: cost1 });
    breakdown.push({ slab: '31 - 60 units', units: units - 30, rate: 4.85, cost: cost2 });
  } else if (units <= 90) {
    const cost1 = 30 * 2.50;
    const cost2 = 30 * 4.85;
    const cost3 = (units - 60) * 7.85;
    energyCharge = cost1 + cost2 + cost3;
    fixedCharge = 360;
    breakdown.push({ slab: '0 - 30 units', units: 30, rate: 2.50, cost: cost1 });
    breakdown.push({ slab: '31 - 60 units', units: 30, rate: 4.85, cost: cost2 });
    breakdown.push({ slab: '61 - 90 units', units: units - 60, rate: 7.85, cost: cost3 });
  } else if (units <= 120) {
    const cost1 = 30 * 2.50;
    const cost2 = 30 * 4.85;
    const cost3 = 30 * 7.85;
    const cost4 = (units - 90) * 10.00;
    energyCharge = cost1 + cost2 + cost3 + cost4;
    fixedCharge = 960;
    breakdown.push({ slab: '0 - 30 units', units: 30, rate: 2.50, cost: cost1 });
    breakdown.push({ slab: '31 - 60 units', units: 30, rate: 4.85, cost: cost2 });
    breakdown.push({ slab: '61 - 90 units', units: 30, rate: 7.85, cost: cost3 });
    breakdown.push({ slab: '91 - 120 units', units: units - 90, rate: 10.00, cost: cost4 });
  } else if (units <= 180) {
    const cost1 = 30 * 2.50;
    const cost2 = 30 * 4.85;
    const cost3 = 30 * 7.85;
    const cost4 = 30 * 10.00;
    const cost5 = (units - 120) * 27.75;
    energyCharge = cost1 + cost2 + cost3 + cost4 + cost5;
    fixedCharge = 1500;
    breakdown.push({ slab: '0 - 30 units', units: 30, rate: 2.50, cost: cost1 });
    breakdown.push({ slab: '31 - 60 units', units: 30, rate: 4.85, cost: cost2 });
    breakdown.push({ slab: '61 - 90 units', units: 30, rate: 7.85, cost: cost3 });
    breakdown.push({ slab: '91 - 120 units', units: 30, rate: 10.00, cost: cost4 });
    breakdown.push({ slab: '121 - 180 units', units: units - 120, rate: 27.75, cost: cost5 });
  } else {
    const cost1 = 30 * 2.50;
    const cost2 = 30 * 4.85;
    const cost3 = 30 * 7.85;
    const cost4 = 30 * 10.00;
    const cost5 = 60 * 27.75;
    const cost6 = (units - 180) * 45.00;
    energyCharge = cost1 + cost2 + cost3 + cost4 + cost5 + cost6;
    fixedCharge = 2000;
    breakdown.push({ slab: '0 - 30 units', units: 30, rate: 2.50, cost: cost1 });
    breakdown.push({ slab: '31 - 60 units', units: 30, rate: 4.85, cost: cost2 });
    breakdown.push({ slab: '61 - 90 units', units: 30, rate: 7.85, cost: cost3 });
    breakdown.push({ slab: '91 - 120 units', units: 30, rate: 10.00, cost: cost4 });
    breakdown.push({ slab: '121 - 180 units', units: 60, rate: 27.75, cost: cost5 });
    breakdown.push({ slab: '181+ units', units: units - 180, rate: 45.00, cost: cost6 });
  }

  const fuelSurchargePercent = 0.0; // Standard 0% in current revised tariff
  const fuelSurcharge = (energyCharge * fuelSurchargePercent);
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
router.post('/calculate', validateBillInput, (req, res) => {
  try {
    const { monthlyKWh, hourlyWh } = req.body;
    let units = parseFloat(monthlyKWh);

    if (isNaN(units) && hourlyWh) {
      units = (parseFloat(hourlyWh) * 24 * 30) / 1000.0;
    }

    if (isNaN(units)) {
      return res.status(400).json({ success: false, error: 'Please provide valid monthlyKWh or hourlyWh' });
    }

    const result = calculateCEBBill(units);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
