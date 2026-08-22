import React, { useState } from 'react';
import axios from 'axios';
import {
  Zap, Thermometer, Users, Tv, Sun, Clock, Calculator, Lightbulb,
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Printer, Sparkles,
  Sliders, Compass, Activity
} from 'lucide-react';
import BillSlabVisualizer from '../../components/BillSlabVisualizer';
import { useToast } from '../../context/ToastContext';

export default function PredictorPage() {
  const { success, error: toastError } = useToast();

  const [indoorTemp, setIndoorTemp] = useState('23.0');
  const [outdoorTemp, setOutdoorTemp] = useState('29.0');
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

  // Preset Scenarios
  const applyPreset = (preset) => {
    if (preset === 'morning') {
      setIndoorTemp('22.5');
      setOutdoorTemp('26.0');
      setHour(7);
      setAppliances({ ac: false, refrigerator: true, lighting: true, tv: false, washingMachine: true, waterHeater: true });
    } else if (preset === 'afternoon') {
      setIndoorTemp('26.0');
      setOutdoorTemp('32.0');
      setHour(14);
      setAppliances({ ac: true, refrigerator: true, lighting: false, tv: false, washingMachine: false, waterHeater: false });
    } else if (preset === 'evening') {
      setIndoorTemp('24.0');
      setOutdoorTemp('28.5');
      setHour(19);
      setAppliances({ ac: true, refrigerator: true, lighting: true, tv: true, washingMachine: false, waterHeater: true });
    } else if (preset === 'night') {
      setIndoorTemp('22.0');
      setOutdoorTemp('25.0');
      setHour(23);
      setAppliances({ ac: true, refrigerator: true, lighting: false, tv: false, washingMachine: false, waterHeater: false });
    }
  };

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

      success(`Energy forecast computed: ${predData.predictedWh} Wh (${predData.usageCategory} Load)`);

    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate prediction. Check system status.';
      setError(msg);
      toastError(msg);
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
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Zap className="w-4 h-4 fill-current" />
          <span>Random Forest Regressor (ML Model Active)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Household Energy Consumption Predictor
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Input environmental sensor conditions and active household appliances to calculate your hourly Wh consumption and Sri Lanka CEB residential tariff bill estimation.
        </p>
      </div>

      {/* Preset Scenarios Buttons */}
      <div className="glass-card p-4 rounded-2xl border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" /> Quick Simulation Scenarios:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset('morning')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:text-emerald-400 text-slate-300 font-medium transition-all"
          >
            🌅 Morning Routine
          </button>
          <button
            type="button"
            onClick={() => applyPreset('afternoon')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:text-amber-400 text-slate-300 font-medium transition-all"
          >
            ☀️ Hot Afternoon (AC)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('evening')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:text-rose-400 text-slate-300 font-medium transition-all"
          >
            🌆 Peak Evening (High)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('night')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-400 text-slate-300 font-medium transition-all"
          >
            🌙 Night Standby
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls */}
        <form onSubmit={handlePredict} className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" /> Environmental Inputs & Sliders
          </h2>

          {/* Indoor Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-emerald-400" /> Indoor Room Temperature
              </label>
              <span className="font-mono font-bold text-emerald-400">{indoorTemp} °C</span>
            </div>
            <input
              type="range"
              min="16"
              max="35"
              step="0.5"
              value={indoorTemp}
              onChange={(e) => setIndoorTemp(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Outdoor Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" /> Outdoor Ambient Temperature
              </label>
              <span className="font-mono font-bold text-amber-400">{outdoorTemp} °C</span>
            </div>
            <input
              type="range"
              min="18"
              max="40"
              step="0.5"
              value={outdoorTemp}
              onChange={(e) => setOutdoorTemp(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Humidity & Occupants Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Indoor Humidity (%)</label>
              <input
                type="number"
                min="20"
                max="100"
                value={indoorHumidity}
                onChange={(e) => setIndoorHumidity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Occupants
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={occupants}
                onChange={(e) => setOccupants(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Time & Day Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Hour (0–23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Building Property Type</label>
              <select
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="House">Residential House</option>
                <option value="Apartment">Apartment Complex</option>
                <option value="Office">Commercial Office</option>
              </select>
            </div>
          </div>

          {/* Active Appliances Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-emerald-400" /> Active Household Appliances ({activeAppliancesCount} Selected)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'ac', label: 'Air Conditioner (AC)' },
                { key: 'refrigerator', label: 'Refrigerator' },
                { key: 'lighting', label: 'LED / Tube Lights' },
                { key: 'tv', label: 'Television & Set Top' },
                { key: 'washingMachine', label: 'Washing Machine' },
                { key: 'waterHeater', label: 'Electric Water Heater' }
              ].map((app) => (
                <label
                  key={app.key}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    appliances[app.key]
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={appliances[app.key]}
                    onChange={(e) => setAppliances({ ...appliances, [app.key]: e.target.checked })}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
                  />
                  <span className="text-xs font-medium">{app.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-90 shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            {loading ? 'Running Random Forest ML Regressor...' : 'Calculate ML Energy Prediction'}
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
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" /> Hourly Energy Forecast
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryBadgeClass(predictionResult.usageCategory)}`}>
                    {predictionResult.usageCategory} Load
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">{predictionResult.predictedWh}</span>
                  <span className="text-2xl font-bold text-emerald-400">Wh</span>
                  <span className="text-xs text-slate-400 ml-auto">({(predictionResult.predictedWh / 1000).toFixed(3)} kWh)</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <span className="block text-xs text-slate-400">Est. Hourly Cost</span>
                    <span className="text-2xl font-bold text-cyan-300 mt-1">Rs. {predictionResult.estimatedCostLKR} LKR</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Lights Sub-Target</span>
                    <span className="text-2xl font-bold text-amber-300 mt-1">{predictionResult.lightsWh} Wh</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print / Save Forecast
                  </button>
                  <span className="text-slate-500 text-[11px]">Saved automatically to your history</span>
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
                    <Lightbulb className="w-4 h-4 text-amber-400" /> Tailored Efficiency Actions for {predictionResult.usageCategory} Usage
                  </h3>
                  <div className="space-y-3 pt-1">
                    {tailoredTips.map((tip) => (
                      <div key={tip._id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>{tip.title}</span>
                          <span className="text-emerald-400">~{tip.potentialSavingsPercent}% Savings</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{tip.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Ready for Instant Energy Forecast</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Adjust input parameters or click any of the preset simulation buttons above, then press <strong className="text-emerald-400">Calculate ML Energy Prediction</strong>.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
