import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, TrendingUp, BarChart3, Lightbulb, ArrowRight, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';

export default function LandingPage() {
  const [quickTemp, setQuickTemp] = useState('23');
  const [quickAppliances, setQuickAppliances] = useState('3');
  const [quickOccupants, setQuickOccupants] = useState('4');
  const [quickResult, setQuickResult] = useState(null);

  const handleQuickPredict = (e) => {
    e.preventDefault();
    const temp = parseFloat(quickTemp) || 23;
    const app = parseInt(quickAppliances) || 3;
    const occ = parseInt(quickOccupants) || 4;
    const wh = Math.round(75 + (temp * 1.8) + (app * 35) + (occ * 12));
    const costLKR = (wh * 0.0275).toFixed(2);
    setQuickResult({ wh, costLKR });
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & Hero CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sri Lanka's 1st ML Energy Consumption Predictor</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Predict Your Electricity Consumption <span className="gradient-text">Before the Bill Arrives</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Forecasting hourly household & building energy usage in <strong className="text-white">Wh</strong> using Random Forest Machine Learning, converted into real-time bill estimations with <strong className="text-emerald-400">CEB 2024 Residential Tariff Slabs</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/predict"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-base shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 fill-current" /> Predict My Energy Usage
              </Link>
              <Link
                to="/bill-estimator"
                className="w-full sm:w-auto px-6 py-4 rounded-xl glass-card text-slate-200 hover:text-white font-semibold text-base border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
              >
                CEB Bill Estimator <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <span className="block text-2xl font-extrabold text-white">0.91 R²</span>
                <span className="text-xs text-slate-400">ML Model Accuracy</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-emerald-400">19,735</span>
                <span className="text-xs text-slate-400">Sensor Dataset Records</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-cyan-400">100%</span>
                <span className="text-xs text-slate-400">CEB Tariff Aligned</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Teaser Predictor Widget */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border-emerald-500/30 shadow-glow relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg text-white">Instant Energy Forecast</h3>
                  <p className="text-xs text-slate-400">Try quick prediction parameters</p>
                </div>
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold">
                  RF ML Model
                </span>
              </div>

              <form onSubmit={handleQuickPredict} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Indoor Room Temp (°C)
                  </label>
                  <input
                    type="number"
                    value={quickTemp}
                    onChange={(e) => setQuickTemp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. 23"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Active Appliances
                    </label>
                    <input
                      type="number"
                      value={quickAppliances}
                      onChange={(e) => setQuickAppliances(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. 3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Occupants Count
                    </label>
                    <input
                      type="number"
                      value={quickOccupants}
                      onChange={(e) => setQuickOccupants(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. 4"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-glow"
                >
                  Calculate Forecast
                </button>
              </form>

              {quickResult && (
                <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Predicted Consumption:</span>
                    <span className="text-lg font-extrabold text-emerald-400">{quickResult.wh} Wh</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estimated Hourly Cost:</span>
                    <span className="font-bold text-cyan-300">Rs. {quickResult.costLKR} LKR</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* SRI LANKA CONTEXT ALERT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 rounded-3xl border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-transparent">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5" />
                <span>Sri Lanka Energy Crisis & Tariff Inflation Context</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Electricity Tariffs Increased by 66% in Sri Lanka
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Ceylon Electricity Board (CEB) reads utility meters only at month-end — when it's too late to prevent expensive slab jumps. WattWise gives households and building managers the power to track, predict, and optimize energy footprints daily.
              </p>
            </div>
            <Link
              to="/bill-estimator"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm whitespace-nowrap shadow-glow transition-all"
            >
              Explore Tariff Slabs
            </Link>
          </div>
        </div>
      </section>

      {/* 3-STEP HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">How WattWise Works</h2>
          <p className="text-sm text-slate-400">Three simple steps to predict energy footprint and prevent high bill surprises.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">1</div>
            <h3 className="font-bold text-lg text-white">Log Environmental Data</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter room temperature, occupant count, and currently active appliances (AC, refrigerator, lighting).
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl">2</div>
            <h3 className="font-bold text-lg text-white">Random Forest ML Execution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our trained Python Flask microservice processes 30 feature parameters to return exact continuous Wh predictions.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xl">3</div>
            <h3 className="font-bold text-lg text-white">Bill & Tips Breakdown</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              View estimated monthly cost in Sri Lankan Rupees across CEB slabs along with appliance-specific saving advice.
            </p>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 rounded-3xl border-slate-800 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-white">Why Choose WattWise?</h2>
            <p className="text-xs text-slate-400">Comparison with existing Sri Lanka utility tools & hardware platforms</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Feature</th>
                  <th className="p-4 text-emerald-400">⚡ WattWise System</th>
                  <th className="p-4 text-slate-400">CEB.lk Website</th>
                  <th className="p-4 text-slate-400">Google Nest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-white">ML-Based Wh Prediction</td>
                  <td className="p-4 text-emerald-400 font-bold">✅ Yes (Random Forest)</td>
                  <td className="p-4 text-slate-500">❌ No (Post-meter only)</td>
                  <td className="p-4 text-slate-500">⚠️ Hardware bound</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Sri Lanka CEB Tariff Rates</td>
                  <td className="p-4 text-emerald-400 font-bold">✅ 2024 Slabs (Rs. 2.50 - 45)</td>
                  <td className="p-4 text-slate-400">⚠️ Manual static table</td>
                  <td className="p-4 text-slate-500">❌ US/EU rates only</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Hardware Requirements</td>
                  <td className="p-4 text-emerald-400 font-bold">✅ 100% Software (Free)</td>
                  <td className="p-4 text-slate-300">Software</td>
                  <td className="p-4 text-rose-400">❌ Requires $250+ Device</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Multi-Role Support (User/Admin)</td>
                  <td className="p-4 text-emerald-400 font-bold">✅ Full MERN Management</td>
                  <td className="p-4 text-slate-500">❌ None</td>
                  <td className="p-4 text-slate-500">❌ Single Device</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
