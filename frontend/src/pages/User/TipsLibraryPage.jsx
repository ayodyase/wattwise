import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lightbulb, Filter, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

export default function TipsLibraryPage() {
  const [tips, setTips] = useState([]);
  const [appliance, setAppliance] = useState('All');
  const [usageLevel, setUsageLevel] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/tips?appliance=${appliance}&usageLevel=${usageLevel}`);
        setTips(res.data.tips || []);
      } catch (err) {
        console.error("Tips fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [appliance, usageLevel]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>CEB Energy Savings Recommendations</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Household Energy Saving Tips</h1>
        <p className="text-xs text-slate-400">
          Tailored energy management advice designed to lower monthly electricity slab consumption.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Appliance:</span>
          <select
            value={appliance}
            onChange={(e) => setAppliance(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All Appliances</option>
            <option value="AC / Cooling">AC / Cooling</option>
            <option value="Refrigerator">Refrigerator</option>
            <option value="Lighting">Lighting</option>
            <option value="Water Heater">Water Heater</option>
            <option value="Electronics">Electronics</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-300">Target Usage Level:</span>
          <select
            value={usageLevel}
            onChange={(e) => setUsageLevel(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All Usage Levels</option>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Very High">Very High</option>
          </select>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tips.map((tip) => (
          <div key={tip._id} className="glass-card p-6 rounded-3xl border-slate-800 flex flex-col justify-between space-y-4 glass-card-hover">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  {tip.appliance}
                </span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Save ~{tip.potentialSavingsPercent}%
                </span>
              </div>
              <h3 className="font-bold text-base text-white">{tip.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{tip.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Target: <strong className="text-white">{tip.usageLevel}</strong></span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Tip
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
