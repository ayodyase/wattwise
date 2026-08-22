import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  Shield, Users, BarChart3, Building2, FileSpreadsheet, Lightbulb,
  ShieldAlert, Cpu, Download, Search, Filter, Trash2, Edit3, UserX,
  UserCheck, RefreshCw, Plus, CheckCircle2, AlertTriangle, Play
} from 'lucide-react';
import { HourlyBarChart, CategoryPieChart } from '../../components/UsageCharts';

export default function AdminDashboardPage() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users');

  // State collections
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [userSearch, setUserSearch] = useState('');
  const [aggregateStats, setAggregateStats] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tips, setTips] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [retrainRes, setRetrainRes] = useState(null);

  // New Forms State
  const [newBuildingName, setNewBuildingName] = useState('');
  const [newBuildingType, setNewBuildingType] = useState('Office');
  const [newBuildingFloors, setNewBuildingFloors] = useState('4');
  const [newBuildingThreshold, setNewBuildingThreshold] = useState('450');

  const [newTipTitle, setNewTipTitle] = useState('');
  const [newTipContent, setNewTipContent] = useState('');
  const [newTipAppliance, setNewTipAppliance] = useState('General');
  const [newTipUsage, setNewTipUsage] = useState('High');

  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementMessage, setNewAnnouncementMessage] = useState('');

  // Bulk CSV state
  const [csvText, setCsvText] = useState('indoorTemp,outdoorTemp,hour,appliancesActive\n22.5,28.0,14,3\n24.0,30.0,19,5\n21.0,26.0,8,2');
  const [bulkPredictions, setBulkPredictions] = useState(null);

  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/api/admin/users?search=${userSearch}`);
      setUsers(res.data.users || []);
      setUserStats(res.data.stats || {});
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const fetchAggregateStats = async () => {
    try {
      const res = await axios.get('/api/analyst/aggregate-stats');
      setAggregateStats(res.data);
    } catch (err) {
      console.error("Fetch aggregate stats error:", err);
    }
  };

  const fetchBuildings = async () => {
    try {
      const bRes = await axios.get('/api/buildings');
      setBuildings(bRes.data.buildings || []);
      const aRes = await axios.get('/api/buildings/alerts/active');
      setAlerts(aRes.data.alerts || []);
    } catch (err) {
      console.error("Fetch buildings error:", err);
    }
  };

  const fetchTips = async () => {
    try {
      const res = await axios.get('/api/tips');
      setTips(res.data.tips || []);
    } catch (err) {
      console.error("Fetch tips error:", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get('/api/admin/audit-logs');
      setAuditLogs(res.data.logs || []);
      const aRes = await axios.get('/api/admin/announcements');
      setAnnouncements(aRes.data.announcements || []);
    } catch (err) {
      console.error("Fetch audit logs error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAggregateStats();
    fetchBuildings();
    fetchTips();
    fetchAuditLogs();
  }, []);

  // User Actions
  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: nextRole });
      fetchUsers();
      setMsg(`Updated role to ${nextRole}`);
    } catch (err) {
      alert("Role update failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await axios.put(`/api/admin/users/${userId}/status`, { status: nextStatus });
      fetchUsers();
      setMsg(`Updated user status to ${nextStatus}`);
    } catch (err) {
      alert("Status update failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user and all associated predictions?")) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      fetchUsers();
      setMsg("User deleted successfully");
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.error || err.message));
    }
  };

  // Add Building
  const handleAddBuilding = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/buildings', {
        name: newBuildingName,
        type: newBuildingType,
        floorsCount: parseInt(newBuildingFloors),
        alertThresholdWh: parseFloat(newBuildingThreshold)
      });
      setNewBuildingName('');
      fetchBuildings();
      setMsg("Building profile registered successfully");
    } catch (err) {
      alert("Add building failed: " + (err.response?.data?.error || err.message));
    }
  };

  // Add Tip
  const handleAddTip = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tips', {
        title: newTipTitle,
        content: newTipContent,
        appliance: newTipAppliance,
        usageLevel: newTipUsage
      });
      setNewTipTitle('');
      setNewTipContent('');
      fetchTips();
      setMsg("New energy tip published to library");
    } catch (err) {
      alert("Add tip failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteTip = async (id) => {
    try {
      await axios.delete(`/api/tips/${id}`);
      fetchTips();
    } catch (err) {
      alert("Delete tip failed");
    }
  };

  // Post Announcement
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/announcements', {
        title: newAnnouncementTitle,
        message: newAnnouncementMessage
      });
      setNewAnnouncementTitle('');
      setNewAnnouncementMessage('');
      fetchAuditLogs();
      setMsg("Announcement broadcast live");
    } catch (err) {
      alert("Announcement failed");
    }
  };

  // Run Bulk Prediction
  const handleRunBulk = async (e) => {
    e.preventDefault();
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const vals = lines[i].split(',').map(v => v.trim());
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = vals[idx];
        });
        rows.push(rowObj);
      }

      const res = await axios.post('/api/predict/bulk', { rows });
      setBulkPredictions(res.data.predictions || []);
    } catch (err) {
      alert("Bulk prediction error: " + (err.response?.data?.error || err.message));
    }
  };

  // Trigger Retrain
  const handleRetrainModel = async () => {
    try {
      const res = await axios.post('/api/admin/retrain-model');
      setRetrainRes(res.data);
      fetchAuditLogs();
    } catch (err) {
      alert("Retrain trigger error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-transparent">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Admin & Analyst Control Console</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Full platform administration including User Management, Aggregate Energy Analytics, Multi-Unit Building Alerts, Batch CSV Predictor, and ML Model Control.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
          Super Admin Workspace
        </span>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow-glow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> User Accounts ({userStats.totalUsers || 0})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 shadow-glow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Aggregate Analytics & Analyst
        </button>

        <button
          onClick={() => setActiveTab('buildings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'buildings' ? 'bg-amber-500 text-slate-950 shadow-glow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Building Manager ({buildings.length})
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bulk' ? 'bg-amber-500 text-slate-950 shadow-glow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Batch CSV Predictor
        </button>

        <button
          onClick={() => setActiveTab('tips')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tips' ? 'bg-amber-500 text-slate-950 shadow-glow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4" /> Content & Tips ({tips.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-amber-500 text-slate-950 shadow-glow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Audit Logs & Comms
        </button>

        <button
          onClick={() => setActiveTab('ml')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ml' ? 'bg-amber-500 text-slate-950 shadow-glow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" /> ML Model & Export
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                placeholder="Search registered accounts by name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
            >
              Search Users
            </button>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/40">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'suspended' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">{u.city || 'Colombo'}</td>
                      <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => handleToggleRole(u._id, u.role)}
                          className="p-1.5 rounded-lg bg-slate-900 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          title="Toggle Role (User <-> Admin)"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u._id, u.status)}
                          className={`p-1.5 rounded-lg bg-slate-900 transition-colors ${
                            u.status === 'suspended' ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-rose-400 hover:bg-rose-500/20'
                          }`}
                          title="Toggle Suspend / Activate"
                        >
                          {u.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AGGREGATE ANALYTICS & ANALYST */}
      {activeTab === 'analytics' && aggregateStats && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-card p-6 rounded-2xl border-slate-800">
              <span className="text-xs text-slate-400">Total System Predictions</span>
              <div className="text-3xl font-extrabold text-white mt-1">{aggregateStats.totalPredictions}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl border-slate-800">
              <span className="text-xs text-slate-400">Registered Managed Buildings</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">{aggregateStats.totalBuildings}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl border-slate-800">
              <span className="text-xs text-slate-400">Data Anonymization Status</span>
              <div className="text-3xl font-extrabold text-cyan-400 mt-1">Verified Clean</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 glass-card p-6 rounded-3xl border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white">Peak Energy Consumption Hours (System-wide Average Wh)</h3>
              <HourlyBarChart data={aggregateStats.hourlyStats.map(h => ({ hourLabel: `${h._id}:00`, avgWh: Math.round(h.avgWh) }))} />
            </div>

            <div className="lg:col-span-4 glass-card p-6 rounded-3xl border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white">Building Property Type Breakdown</h3>
              <div className="space-y-3 pt-2 text-xs">
                {aggregateStats.buildingTypeStats.map(bt => (
                  <div key={bt._id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{bt._id || 'House'}</span>
                      <span className="block text-[11px] text-slate-400">{bt.count} predictions</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-400">{Math.round(bt.avgWh)} Wh</span>
                      <span className="block text-[11px] text-cyan-300">Rs. {bt.totalCost.toFixed(0)} LKR</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUILDING MANAGER */}
      {activeTab === 'buildings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Add Building Form */}
          <form onSubmit={handleAddBuilding} className="glass-card p-6 rounded-3xl border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Building Name</label>
              <input
                type="text"
                required
                value={newBuildingName}
                onChange={(e) => setNewBuildingName(e.target.value)}
                placeholder="e.g. Orion Tower B"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
              <select
                value={newBuildingType}
                onChange={(e) => setNewBuildingType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value="Office">Commercial Office</option>
                <option value="Apartment">Apartment Complex</option>
                <option value="House">Residential Villa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Threshold (Wh)</label>
              <input
                type="number"
                value={newBuildingThreshold}
                onChange={(e) => setNewBuildingThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-glow transition-all"
            >
              Register Property
            </button>
          </form>

          {/* Registered Buildings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((b) => (
              <div key={b._id} className="glass-card p-6 rounded-3xl border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-base">{b.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">{b.type}</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Floors: <strong className="text-slate-200">{b.floorsCount}</strong> | Units: <strong className="text-slate-200">{b.unitsCount}</strong></p>
                  <p>Alert Threshold: <strong className="text-amber-400">{b.alertThresholdWh} Wh</strong></p>
                  <p>Location: <strong className="text-slate-200">{b.location}</strong></p>
                </div>
              </div>
            ))}
          </div>

          {/* Active Threshold Alerts */}
          {alerts.length > 0 && (
            <div className="glass-card p-6 rounded-3xl border-rose-500/30 space-y-4">
              <h3 className="font-bold text-sm text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Active Building Usage Alerts ({alerts.length})
              </h3>
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a._id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{a.buildingId?.name || 'Property'}</span>
                      <p className="text-slate-400">{a.message}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">{a.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BATCH CSV PREDICTOR */}
      {activeTab === 'bulk' && (
        <div className="space-y-6 animate-fade-in">
          <form onSubmit={handleRunBulk} className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Batch Energy Prediction CSV Processor</h3>
            <p className="text-xs text-slate-400">Paste multi-household or zone CSV input rows below for instant Flask ML batch prediction.</p>
            
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs focus:border-amber-500 focus:outline-none"
            />

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-glow transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> Run Batch ML Forecast
            </button>
          </form>

          {bulkPredictions && (
            <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white">Batch Prediction Output Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Row #</th>
                      <th className="p-3">Indoor Temp</th>
                      <th className="p-3">Outdoor Temp</th>
                      <th className="p-3">Hour</th>
                      <th className="p-3">Predicted Wh</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Est Cost (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {bulkPredictions.map((bp) => (
                      <tr key={bp.rowId} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">#{bp.rowId}</td>
                        <td className="p-3">{bp.indoorTemp}°C</td>
                        <td className="p-3">{bp.outdoorTemp}°C</td>
                        <td className="p-3">{bp.hour}:00</td>
                        <td className="p-3 font-bold text-emerald-400">{bp.predictedWh} Wh</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200">{bp.usageCategory}</span></td>
                        <td className="p-3 text-right font-bold text-cyan-300">Rs. {bp.estimatedCostLKR}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CONTENT & TIPS */}
      {activeTab === 'tips' && (
        <div className="space-y-6 animate-fade-in">
          <form onSubmit={handleAddTip} className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Publish New Energy Saving Tip</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tip Title</label>
                <input
                  type="text"
                  required
                  value={newTipTitle}
                  onChange={(e) => setNewTipTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Appliance Category</label>
                <select
                  value={newTipAppliance}
                  onChange={(e) => setNewTipAppliance(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="AC / Cooling">AC / Cooling</option>
                  <option value="Refrigerator">Refrigerator</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Water Heater">Water Heater</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Usage Level</label>
                <select
                  value={newTipUsage}
                  onChange={(e) => setNewTipUsage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="All">All</option>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Advice Content Body</label>
              <textarea
                rows={3}
                required
                value={newTipContent}
                onChange={(e) => setNewTipContent(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-glow">
              Publish Tip Article
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((t) => (
              <div key={t._id} className="glass-card p-4 rounded-2xl border-slate-800 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-white">{t.title}</span>
                  <p className="text-slate-400">{t.content}</p>
                </div>
                <button onClick={() => handleDeleteTip(t._id)} className="text-slate-500 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS & ANNOUNCEMENTS */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-fade-in">
          {/* Post Announcement */}
          <form onSubmit={handleAddAnnouncement} className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Broadcast Platform Announcement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Title"
                value={newAnnouncementTitle}
                onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
              <input
                type="text"
                required
                placeholder="Message body"
                value={newAnnouncementMessage}
                onChange={(e) => setNewAnnouncementMessage(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
              Broadcast Live Announcement
            </button>
          </form>

          {/* Audit Logs Table */}
          <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white">Security & Administrative Activity Audit Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-semibold text-white">{log.userName}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300">{log.action}</span></td>
                      <td className="p-3 text-slate-300">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ML MODEL & EXPORTS */}
      {activeTab === 'ml' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" /> Random Forest Regressor ML Model Status
            </h3>
            <p className="text-xs text-slate-400">
              Model loaded: <strong className="text-emerald-400">energy_rf_model.pkl</strong> | Scaler: <strong className="text-cyan-400">energy_scaler.pkl</strong> | Features: <strong className="text-white">30 features</strong>
            </p>

            <button
              onClick={handleRetrainModel}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-glow transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Trigger Model Evaluation / Retrain Workflow
            </button>

            {retrainRes && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 text-xs space-y-2">
                <span className="font-bold text-emerald-400">{retrainRes.message}</span>
                <p className="text-slate-300">R² Score: <strong className="text-white">{retrainRes.r2Score}</strong> | MAE: <strong className="text-white">{retrainRes.mae} Wh</strong> | RMSE: <strong className="text-white">{retrainRes.rmse} Wh</strong></p>
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" /> System Data CSV Reports Exporter
            </h3>
            <div className="flex gap-4">
              <a
                href="/api/admin/export-csv?type=predictions"
                download
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export Predictions Dataset (CSV)
              </a>
              <a
                href="/api/admin/export-csv?type=users"
                download
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export Registered Accounts (CSV)
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
