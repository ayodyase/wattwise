import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Trash2, Search, Filter, AlertCircle, RefreshCw, Download, Printer, Zap } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function PredictionHistoryPage() {
  const { success, error: toastError } = useToast();

  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/predict/history?limit=100');
      setPredictions(res.data.predictions || []);
    } catch (err) {
      console.error("History fetch error:", err);
      toastError("Failed to fetch prediction history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prediction record?")) return;
    try {
      await axios.delete(`/api/predict/history/${id}`);
      setPredictions(predictions.filter(p => p._id !== id));
      success("Prediction record deleted");
    } catch (err) {
      toastError(err.response?.data?.error || "Delete failed");
    }
  };

  const handleExportCSV = () => {
    if (predictions.length === 0) {
      toastError("No predictions to export");
      return;
    }

    let csvContent = "Date,PropertyType,IndoorTemp,OutdoorTemp,Hour,DayOfWeek,ActiveAppliances,PredictedWh,Category,EstCostLKR\n";
    predictions.forEach(p => {
      csvContent += `"${new Date(p.createdAt).toISOString()}","${p.buildingType}",${p.indoorTemp},${p.outdoorTemp},${p.hour},"${p.dayOfWeek}",${p.appliancesActive},${p.predictedWh},"${p.usageCategory}",${p.estimatedCostLKR}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wattwise_my_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Prediction history exported to CSV");
  };

  const filteredPredictions = predictions.filter(p => {
    const matchesCategory = filterCategory === 'All' || p.usageCategory === filterCategory;
    const matchesSearch = p.buildingType.toLowerCase().includes(search.toLowerCase()) || p.dayOfWeek.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <History className="w-7 h-7 text-emerald-400" /> Prediction History Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review past energy consumption forecasts saved under your account.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:text-emerald-400 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
            title="Print Summary"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>

          <button
            onClick={fetchHistory}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="glass-card p-4 rounded-2xl border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by building type or day..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Low">Low (&lt; 80 Wh)</option>
            <option value="Normal">Normal (80 - 180 Wh)</option>
            <option value="High">High (181 - 350 Wh)</option>
            <option value="Very High">Very High (&gt; 350 Wh)</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card rounded-3xl overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Property Type</th>
                <th className="p-4">Temp (°C)</th>
                <th className="p-4">Hour / Day</th>
                <th className="p-4">Active Appliances</th>
                <th className="p-4">Predicted Wh</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Est. Cost (LKR)</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredPredictions.length > 0 ? (
                filteredPredictions.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-medium text-white">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="p-4">{p.buildingType}</td>
                    <td className="p-4">{p.indoorTemp}°C</td>
                    <td className="p-4">{p.hour}:00 ({p.dayOfWeek})</td>
                    <td className="p-4">{p.appliancesActive} active</td>
                    <td className="p-4 font-bold text-emerald-400">{p.predictedWh} Wh</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.usageCategory === 'High' ? 'bg-amber-500/20 text-amber-300' :
                        p.usageCategory === 'Very High' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {p.usageCategory}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-cyan-300">Rs. {p.estimatedCostLKR}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                    {loading ? 'Loading prediction history logs...' : 'No prediction history records match your query'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
