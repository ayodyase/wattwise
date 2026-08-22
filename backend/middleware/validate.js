// Input validation middleware for energy prediction and bill inputs

const validatePredictionInput = (req, res, next) => {
  const { indoorTemp, outdoorTemp, indoorHumidity, outdoorHumidity, occupants, hour } = req.body;

  if (indoorTemp !== undefined) {
    const temp = parseFloat(indoorTemp);
    if (isNaN(temp) || temp < -10 || temp > 60) {
      return res.status(400).json({ success: false, error: 'Indoor temperature must be a number between -10°C and 60°C' });
    }
  }

  if (outdoorTemp !== undefined) {
    const temp = parseFloat(outdoorTemp);
    if (isNaN(temp) || temp < -20 || temp > 60) {
      return res.status(400).json({ success: false, error: 'Outdoor temperature must be a number between -20°C and 60°C' });
    }
  }

  if (indoorHumidity !== undefined) {
    const rh = parseFloat(indoorHumidity);
    if (isNaN(rh) || rh < 0 || rh > 100) {
      return res.status(400).json({ success: false, error: 'Indoor relative humidity must be between 0% and 100%' });
    }
  }

  if (occupants !== undefined) {
    const occ = parseInt(occupants);
    if (isNaN(occ) || occ < 1 || occ > 100) {
      return res.status(400).json({ success: false, error: 'Occupants count must be between 1 and 100' });
    }
  }

  if (hour !== undefined) {
    const h = parseInt(hour);
    if (isNaN(h) || h < 0 || h > 23) {
      return res.status(400).json({ success: false, error: 'Hour must be an integer between 0 and 23' });
    }
  }

  next();
};

const validateBillInput = (req, res, next) => {
  const { monthlyKWh, hourlyWh } = req.body;
  if (monthlyKWh === undefined && hourlyWh === undefined) {
    return res.status(400).json({ success: false, error: 'Please specify either monthlyKWh or hourlyWh' });
  }

  if (monthlyKWh !== undefined) {
    const kwh = parseFloat(monthlyKWh);
    if (isNaN(kwh) || kwh < 0) {
      return res.status(400).json({ success: false, error: 'Monthly kWh must be a positive number' });
    }
  }

  next();
};

module.exports = {
  validatePredictionInput,
  validateBillInput
};
