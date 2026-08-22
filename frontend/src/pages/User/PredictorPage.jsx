import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, Thermometer, Users, Tv, Sun, Clock, Calculator, Lightbulb, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import BillSlabVisualizer from '../../components/BillSlabVisualizer';

export default function PredictorPage() {
  const [indoorTemp, setIndoorTemp] = useState('22.5');
  const [outdoorTemp, setOutdoorTemp] = useState('28.0');
  const [indoorHumidity, setIndoorHumidity] = useState('60');
  const [outdoorHumidity, setOutdoorHumidity] = useState('75');
  const [occupants, setOccupants] = useState('3');
  const [hour, setHour] = useState(new Date().getHours());
  const [dayOfWeek, setDayOfWeek] = useState(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]);
  const [buildingType, setBuildingType] = useState('House');
  
  // Appliance checkboxes
  const [appliances, setAppliances] = useState({
    ac: true,
    refrigerator: true,
    lighting: true,
    tv: true,
    washingMachine: false,
    waterHeater: false
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [billCalculation, setBillCalculation] = useState(null);
  const [tailoredTips, setTailoredTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeAppliancesCount = Object.values(appliances).filter(Boolean).length;

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/predict', {
        indoorTemp: parseFloat(indoorTemp),
        outdoorTemp: parseFloat(outdoorTemp),
        indoorHumidity: parseFloat(indoorHumidity),
        outdoorHumidity: parseFloat(outdoorHumidity),
        occupants: parseInt(occupants),
        appliancesActive: activeAppliancesCount,
        hour: parseInt(hour),
        dayOfWeek,
        buildingType
      });

      const predData = res.data.prediction;
      setPredictionResult(predData);

      // Fetch CEB Bill Calculation
      const billRes = await axios.post('/api/bill/calculate', {
        hourlyWh: predData.predictedWh
      });
      setBillCalculation(billRes.data);

      // Fetch Tailored Energy Tips
      const tipsRes = await axios.get(`/api/tips?usageLevel=${predData.usageCategory}`);
      setTailoredTips(tipsRes.data.tips || []);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate prediction. Check system status.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Normal': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'High': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Very High': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="space-y-2 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Random Forest Regressor (ML Model Active)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Household Energy Consumption Predictor</h1>
        <p className="text-sm text-slate-400">
          Enter current environmental conditions and active appliances to calculate your hourly Wh consumption and Sri Lanka CEB tariff bill estimation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls */}
        <form onSubmit={handlePredict} className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-emerald-400" /> Input Conditions & Parameters
          </h2>

          {/* Temp & Humidity Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Indoor Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={indoorTemp}
                onChange={(e) => setIndoorTemp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Outdoor Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={outdoorTemp}
                onChange={(e) => setOutdoorTemp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Indoor Humidity (%)</label>
              <input
                type="number"
                value={indoorHumidity}
                onChange={(e) => setIndoorHumidity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Outdoor Humidity (%)</label>
              <input
                type="number"
                value={outdoorHumidity}
                onChange={(e) => setOutdoorHumidity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Occupants & Building Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Occupants Count
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={occupants}
                onChange={(e) => setOccupants(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Building Property Type</label>
              <select
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="House">Residential House</option>
                <option value="Apartment">Apartment Complex</option>
                <option value="Office">Commercial Office</option>
              </select>
            </div>
          </div>

          {/* Time & Day */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Hour of Day (0–23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Appliances Checkboxes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1">
              <Tv className="w-3.5 h-3.5 text-emerald-400" /> Active Household Appliances ({activeAppliancesCount})
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.keys(appliances).map((appKey) => {
                const labels = {
                  ac: 'Air Conditioner (AC)',
                  refrigerator: 'Refrigerator',
                  lighting: 'LED / Tube Lights',
                  tv: 'Television & Setup Box',
                  washingMachine: 'Washing Machine',
                  waterHeater: 'Water Heater'
                };
                return (
                  <label key={appKey} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={appliances[appKey]}
                      onChange={(e) => setAppliances({ ...appliances, [appKey]: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
                    />
                    <span className="text-slate-300">{labels[appKey]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-90 shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            {loading ? 'Running ML Regressor...' : 'Calculate ML Energy Prediction'}
          </button>
        </form>

        {/* Right Column: Prediction Results Card */}
        <div className="lg:col-span-6 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {predictionResult ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Primary Output Showcase */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-slate-900 to-transparent space-y-6">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Hourly Energy Forecast</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryBadgeClass(predictionResult.usageCategory)}`}>
                    {predictionResult.usageCategory} Usage
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold text-white">{predictionResult.predictedWh}</span>
                  <span className="text-xl font-bold text-emerald-400">Wh</span>
                  <span className="text-xs text-slate-400 ml-auto">({(predictionResult.predictedWh / 1000).toFixed(3)} kWh)</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <span className="block text-xs text-slate-400">Est. Hourly Cost</span>
                    <span className="text-xl font-bold text-cyan-300">Rs. {predictionResult.estimatedCostLKR} LKR</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Lights Energy Sub-Target</span>
                    <span className="text-xl font-bold text-amber-300">{predictionResult.lightsWh} Wh</span>
                  </div>
                </div>

              </div>

              {/* CEB Bill Estimation Section */}
              {billCalculation && (
                <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-400" /> Sri Lanka CEB Monthly Bill Estimation
                  </h3>
                  <BillSlabVisualizer billData={billCalculation} />
                </div>
              )}

              {/* Dynamically Loaded Tips */}
              {tailoredTips.length > 0 && (
                <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-3">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" /> Personalized Energy Saving Recommendations
                  </h3>
                  <div className="space-y-3 pt-1">
                    {tailoredTips.map((tip) => (
                      <div key={tip._id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span>{tip.title}</span>
                          <span className="text-emerald-400">~{tip.potentialSavingsPercent}% Savings</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{tip.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Ready to Forecast Energy Footprint</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Adjust input environmental parameters on the left and click <strong className="text-emerald-400">Calculate ML Energy Prediction</strong> to view instant Wh forecasts and CEB tariff slab calculations.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
