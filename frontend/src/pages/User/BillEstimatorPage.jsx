import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, ShieldCheck, Zap, ArrowRight, Info } from 'lucide-react';
import BillSlabVisualizer from '../../components/BillSlabVisualizer';

export default function BillEstimatorPage() {
  const [monthlyKWh, setMonthlyKWh] = useState('145');
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateBill = async (kwh) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/bill/calculate', {
        monthlyKWh: parseFloat(kwh) || 0
      });
      setBillData(res.data);
    } catch (err) {
      console.error("Bill calculate error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateBill(monthlyKWh);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateBill(monthlyKWh);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" />
          <span>Sri Lanka CEB 2024 Residential Tariff Slabs</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Monthly Electricity Bill Estimator</h1>
        <p className="text-xs text-slate-400">
          Enter your total monthly consumption in kWh to compute your expected Ceylon Electricity Board bill along with itemized slab costs.
        </p>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-3xl border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-300 mb-1">Total Estimated Monthly Units (kWh)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={monthlyKWh}
            onChange={(e) => setMonthlyKWh(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-lg focus:border-emerald-500 focus:outline-none"
            placeholder="e.g. 145"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-90 shadow-glow transition-all whitespace-nowrap self-end"
        >
          {loading ? 'Calculating...' : 'Calculate Bill Breakdown'}
        </button>
      </form>

      {/* Slab Visualizer */}
      {billData && (
        <div className="animate-fade-in">
          <BillSlabVisualizer billData={billData} />
        </div>
      )}

    </div>
  );
}
