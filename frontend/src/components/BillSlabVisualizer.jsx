import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function BillSlabVisualizer({ billData }) {
  if (!billData) return null;

  const { monthlyKWh, energyCharge, fixedCharge, totalBillLKR, breakdown, savingsTips } = billData;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent">
          <span className="block text-xs text-slate-400 font-medium">Estimated Monthly Bill</span>
          <div className="text-3xl font-extrabold text-white mt-1">
            Rs. {totalBillLKR.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="inline-block text-[11px] text-emerald-400 mt-2 font-medium">
            Based on {monthlyKWh} kWh total usage
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <span className="block text-xs text-slate-400 font-medium">Energy Charge</span>
          <div className="text-2xl font-bold text-slate-200 mt-1">
            Rs. {energyCharge.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="block text-[11px] text-slate-400 mt-2">
            Sum of per-unit tariff slab costs
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <span className="block text-xs text-slate-400 font-medium">Fixed Monthly Charge</span>
          <div className="text-2xl font-bold text-slate-200 mt-1">
            Rs. {fixedCharge.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="block text-[11px] text-slate-400 mt-2">
            CEB slab maintenance fee
          </span>
        </div>
      </div>

      {/* Slab Breakdown Table */}
      <div className="glass-card rounded-2xl overflow-hidden border-slate-800">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            CEB 2024 Residential Tariff Slab Breakdown
          </h3>
          <span className="text-xs text-slate-400">Total Units: {monthlyKWh} kWh</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Tariff Slab</th>
                <th className="px-6 py-3">Units Used</th>
                <th className="px-6 py-3">Rate (LKR/unit)</th>
                <th className="px-6 py-3 text-right">Cost (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {breakdown && breakdown.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-white">{item.slab}</td>
                  <td className="px-6 py-3.5 text-slate-300">{item.units} kWh</td>
                  <td className="px-6 py-3.5 text-emerald-400 font-semibold">Rs. {item.rate.toFixed(2)}</td>
                  <td className="px-6 py-3.5 text-right font-bold text-white">Rs. {item.cost.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-slate-900/40">
                <td className="px-6 py-3 font-semibold text-slate-400" colSpan={3}>Fixed Charge</td>
                <td className="px-6 py-3 text-right font-bold text-amber-400">Rs. {fixedCharge.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Savings Tips Box */}
      {savingsTips && savingsTips.length > 0 && (
        <div className="glass-card p-5 rounded-2xl border-cyan-500/30 bg-cyan-950/20 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Info className="w-4 h-4" /> Recommended Bill Reduction Steps
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {savingsTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
