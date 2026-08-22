import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Zap, TrendingUp, Calculator, History, Calendar, AlertCircle } from 'lucide-react';
import { TrendLineChart, CategoryPieChart } from '../../components/UsageCharts';
import { Link } from 'react-router-dom';

export default function UserDashboardPage() {
  const { user } = useContext(AuthContext);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/predict/history?limit=30');
        setPredictions(res.data.predictions || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const totalCount = predictions.length;
  const avgWh = totalCount > 0 ? Math.round(predictions.reduce((acc, curr) => acc + curr.predictedWh, 0) / totalCount) : 0;
  const estimatedMonthlyLKR = Math.round((avgWh * 24 * 30 * 0.0275) * 100) / 100;

  // Chart data formatting
  const trendData = predictions.slice().reverse().map(p => ({
    date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predictedWh: p.predictedWh
  }));

  const categoryCounts = predictions.reduce((acc, p) => {
    acc[p.usageCategory] = (acc[p.usageCategory] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat]
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border-slate-800 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-transparent">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-xs text-slate-400 mt-1">Here is your personal household energy footprint and prediction analytics.</p>
        </div>
        <Link
          to="/predict"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow transition-all flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4 fill-current" /> New Energy Forecast
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Logged Predictions</span>
          <div className="text-3xl font-extrabold text-white">{totalCount}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Saved in database</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Average Predicted Wh</span>
          <div className="text-3xl font-extrabold text-emerald-400">{avgWh} Wh</div>
          <span className="text-[11px] text-slate-400">Mean hourly load</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Est. Monthly Bill Projection</span>
          <div className="text-3xl font-extrabold text-cyan-400">Rs. {estimatedMonthlyLKR.toLocaleString()}</div>
          <span className="text-[11px] text-cyan-300">CEB Slab Calculation</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card p-6 rounded-3xl border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Energy Consumption Trend (Wh)
          </h3>
          <TrendLineChart data={trendData} />
        </div>

        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Usage Category Ratio
          </h3>
          <CategoryPieChart data={pieData} />
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" /> Recent Logged Predictions
          </h3>
          <Link to="/history" className="text-xs text-emerald-400 font-semibold hover:underline">View All</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Indoor Temp</th>
                <th className="p-3">Hour</th>
                <th className="p-3">Predicted Wh</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Est. Cost (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {predictions.slice(0, 5).map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-medium text-white">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{p.indoorTemp}°C</td>
                  <td className="p-3">{p.hour}:00</td>
                  <td className="p-3 font-bold text-emerald-400">{p.predictedWh} Wh</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{p.usageCategory}</span></td>
                  <td className="p-3 text-right font-semibold text-cyan-300">Rs. {p.estimatedCostLKR}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
