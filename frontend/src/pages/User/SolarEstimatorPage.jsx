import React, { useState } from 'react';
import { Sun, BatteryCharging, Zap, TrendingDown, DollarSign, Leaf, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SolarEstimatorPage() {
  const [systemSizeKW, setSystemSizeKW] = useState(5);
  const [currentMonthlyBillLKR, setCurrentMonthlyBillLKR] = useState(18500);
  const [sunHours, setSunHours] = useState(4.8); // Sri Lanka average peak sun hours

  // Calculations
  const dailyGenerationKWh = systemSizeKW * sunHours * 0.82; // 82% performance ratio
  const monthlyGenerationKWh = Math.round(dailyGenerationKWh * 30);
  
  // Approximate capital cost in Sri Lanka (~Rs. 260,000 per kW complete installation)
  const systemCostLKR = systemSizeKW * 260000;
  
  // CEB Net-Plus / Net-Accounting export value (approx. Rs. 27.50 / kWh or direct bill offset)
  const estimatedMonthlySavingsLKR = Math.min(currentMonthlyBillLKR, Math.round(monthlyGenerationKWh * 32.5));
  const newEstimatedBillLKR = Math.max(0, currentMonthlyBillLKR - estimatedMonthlySavingsLKR);
  
  // Annual Savings & Payback
  const annualSavingsLKR = estimatedMonthlySavingsLKR * 12;
  const paybackYears = annualSavingsLKR > 0 ? (systemCostLKR / annualSavingsLKR).toFixed(1) : 0;

  // CO2 offset (~0.85 kg CO2 per kWh in SL thermal grid mix)
  const annualCO2OffsetKg = Math.round(monthlyGenerationKWh * 12 * 0.85);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border-amber-500/40 text-amber-300 text-xs font-semibold">
          <Sun className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>Sri Lanka Solar Net-Accounting & CEB Tariff Offset</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Rooftop Solar & Energy Offset Simulator
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Simulate how installing a grid-tied rooftop solar PV system offsets high CEB tariff slabs and eliminates your monthly electricity bill.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BatteryCharging className="w-5 h-5 text-amber-400" /> System Configuration
          </h3>

          {/* System Size Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Target Solar System Capacity</span>
              <span className="text-lg font-extrabold text-amber-400 font-mono">{systemSizeKW} kW</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={systemSizeKW}
              onChange={(e) => setSystemSizeKW(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>1 kW (Small Home)</span>
              <span>5 kW (Standard House)</span>
              <span>20 kW (Commercial)</span>
            </div>
          </div>

          {/* Current Bill Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Current Monthly Electricity Bill</span>
              <span className="text-lg font-extrabold text-rose-400 font-mono">Rs. {currentMonthlyBillLKR.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="80000"
              step="1000"
              value={currentMonthlyBillLKR}
              onChange={(e) => setCurrentMonthlyBillLKR(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Rs. 2,000</span>
              <span>Rs. 40,000</span>
              <span>Rs. 80,000</span>
            </div>
          </div>

          {/* Sun Hours */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-300">
              Average Daily Sun Hours (Sri Lanka Region)
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { label: 'Western (4.5h)', val: 4.5 },
                { label: 'Southern (4.8h)', val: 4.8 },
                { label: 'Northern (5.4h)', val: 5.4 }
              ].map((loc) => (
                <button
                  key={loc.label}
                  type="button"
                  onClick={() => setSunHours(loc.val)}
                  className={`py-2 px-2.5 rounded-xl border font-semibold text-[11px] transition-all ${
                    sunHours === loc.val
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sri Lanka CEB Net-Metering Scheme</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Under CEB Net-Accounting, excess energy generated during daylight is exported back to the national grid at statutory tariff buyback rates.
            </p>
          </div>
        </div>

        {/* Right Column: Simulation Output */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Projection Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-slate-900 to-transparent space-y-6">
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">Estimated Generation</span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {monthlyGenerationKWh} kWh / Month
              </span>
            </div>

            {/* Bill Reduction Comparison */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="block text-[11px] text-slate-400">Before Solar</span>
                <span className="text-2xl font-extrabold text-rose-400 mt-1">
                  Rs. {currentMonthlyBillLKR.toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-500 mt-1">Monthly CEB Bill</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/40">
                <span className="block text-[11px] text-slate-400">After Solar Offset</span>
                <span className="text-2xl font-extrabold text-emerald-400 mt-1">
                  Rs. {newEstimatedBillLKR.toLocaleString()}
                </span>
                <span className="block text-[10px] text-emerald-400 font-semibold mt-1">
                  Save Rs. {estimatedMonthlySavingsLKR.toLocaleString()} / mo
                </span>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
              <div>
                <span className="block text-xs text-slate-400">System Cost</span>
                <span className="text-base font-bold text-white mt-0.5">Rs. {(systemCostLKR / 100000).toFixed(1)} Lakhs</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Payback Period</span>
                <span className="text-base font-bold text-amber-300 mt-0.5">{paybackYears} Years</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">CO₂ Offset</span>
                <span className="text-base font-bold text-cyan-400 mt-0.5">{(annualCO2OffsetKg / 1000).toFixed(1)} Tons/yr</span>
              </div>
            </div>

          </div>

          {/* Environmental Impact Box */}
          <div className="glass-card p-6 rounded-3xl border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white">Clean Energy Contribution</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                A {systemSizeKW} kW solar installation eliminates approx. <strong className="text-emerald-400">{annualCO2OffsetKg.toLocaleString()} kg of CO₂ emissions</strong> every year — equivalent to planting {Math.round(annualCO2OffsetKg / 22)} trees.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Back to Consumption Predictor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
