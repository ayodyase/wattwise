import React from 'react';
import { Zap, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-bold text-lg text-white">Watt<span className="text-emerald-400">Wise</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI-powered smart household & building energy consumption forecasting platform tailored for Sri Lanka Ceylon Electricity Board (CEB) residential tariff slabs.
          </p>
          <p className="text-[11px] text-slate-500">
            ICBT University | BSc Software Engineering Final Year Project
          </p>
        </div>

        {/* Col 2: Features */}
        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Core Features</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/predict" className="hover:text-emerald-400 transition-colors">ML Energy Predictor</Link></li>
            <li><Link to="/bill-estimator" className="hover:text-emerald-400 transition-colors">CEB 2024 Bill Estimator</Link></li>
            <li><Link to="/tips" className="hover:text-emerald-400 transition-colors">Energy Saving Advice</Link></li>
            <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Personal Analytics</Link></li>
          </ul>
        </div>

        {/* Col 3: Sri Lanka Tariff Slabs */}
        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">CEB Tariff Slabs (2024)</h4>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li className="flex justify-between"><span>0 – 30 Units</span> <span className="text-emerald-400">Rs. 2.50</span></li>
            <li className="flex justify-between"><span>31 – 60 Units</span> <span className="text-emerald-400">Rs. 4.85</span></li>
            <li className="flex justify-between"><span>61 – 90 Units</span> <span className="text-cyan-400">Rs. 7.85</span></li>
            <li className="flex justify-between"><span>91 – 120 Units</span> <span className="text-amber-400">Rs. 10.00</span></li>
            <li className="flex justify-between"><span>121 – 180 Units</span> <span className="text-orange-400">Rs. 27.75</span></li>
            <li className="flex justify-between"><span>181+ Units</span> <span className="text-rose-400">Rs. 45.00</span></li>
          </ul>
        </div>

        {/* Col 4: Tech Stack & System */}
        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Tech Architecture</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            MERN Stack (MongoDB, Express.js, React, Node.js) + Python Flask ML Microservice with Random Forest Regressor (R² = 0.91).
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active ML Status: Online
            </span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 WattWise Energy System. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed for Sustainability & Energy Efficiency in Sri Lanka
        </p>
      </div>
    </footer>
  );
}
