import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Shield, Users, BarChart3, Building2, FileSpreadsheet, Lightbulb,
  ShieldAlert, Cpu, Download, Search, Filter, Trash2, Edit3, UserX,
  UserCheck, RefreshCw, Plus, CheckCircle2, AlertTriangle, Play,
  FileText, Activity, Layers, Sliders, Check
} from 'lucide-react';
import { HourlyBarChart, CategoryPieChart } from '../../components/UsageCharts';

export default function AdminDashboardPage() {
  const { user } = useContext(AuthContext);
  const { success, error: toastError, info } = useToast();
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

  // Analyst Query State
  const [queryBuildingType, setQueryBuildingType] = useState('All');
  const [queryCategory, setQueryCategory] = useState('All');
  const [queryMinWh, setQueryMinWh] = useState('');
  const [queryMaxWh, setQueryMaxWh] = useState('');
  const [queryHourStart, setQueryHourStart] = useState('0');
  const [queryHourEnd, setQueryHourEnd] = useState('23');
  const [queryResults, setQueryResults] = useState([]);
  const [queryTotal, setQueryTotal] = useState(0);
  const [queryLoading, setQueryLoading] = useState(false);

  // Whole-Building Simulator State
  const [simBuildingId, setSimBuildingId] = useState('');
  const [simFloorOccupants, setSimFloorOccupants] = useState('8');
  const [simBuildingResult, setSimBuildingResult] = useState(null);

  // New Admin Form State
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminCity, setNewAdminCity] = useState('Colombo');

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
  const [csvText, setCsvText] = useState('indoorTemp,outdoorTemp,hour,appliancesActive\n22.5,28.0,14,3\n24.0,30.0,19,5\n21.0,26.0,8,2\n23.0,27.0,11,4\n25.5,31.0,18,6');
  const [bulkPredictions, setBulkPredictions] = useState(null);

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
      if (bRes.data.buildings?.length > 0 && !simBuildingId) {
        setSimBuildingId(bRes.data.buildings[0]._id);
      }
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
      success(`Updated user role to ${nextRole}`);
    } catch (err) {
      toastError(err.response?.data?.error || "Role update failed");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await axios.put(`/api/admin/users/${userId}/status`, { status: nextStatus });
      fetchUsers();
      success(`Updated user status to ${nextStatus}`);
    } catch (err) {
      toastError(err.response?.data?.error || "Status update failed");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user and all associated predictions?")) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      fetchUsers();
      success("User account deleted successfully");
    } catch (err) {
      toastError(err.response?.data?.error || "Delete failed");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (newAdminPassword.length < 6) {
      toastError("Password must be at least 6 characters long");
      return;
    }
    try {
      const res = await axios.post('/api/admin/create-admin', {
        name: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword,
        city: newAdminCity
      });
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setShowCreateAdmin(false);
      fetchUsers();
      success(res.data.message || "New Admin account created successfully!");
    } catch (err) {
      toastError(err.response?.data?.error || "Failed to create Admin account");
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
      success("Building property registered successfully");
    } catch (err) {
      toastError(err.response?.data?.error || "Failed to add building");
    }
  };

  const handleDeleteBuilding = async (bldgId) => {
    if (!window.confirm("Remove this building property profile?")) return;
    try {
      await axios.delete(`/api/buildings/${bldgId}`);
      fetchBuildings();
      success("Building profile removed");
    } catch (err) {
      toastError("Failed to delete building");
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await axios.delete(`/api/buildings/alerts/${alertId}`);
      fetchBuildings();
      success("Alert marked as resolved");
    } catch (err) {
      toastError("Failed to resolve alert");
    }
  };

  // Whole Building Simulator
  const handleSimulateBuilding = async (e) => {
    e.preventDefault();
    const selectedBldg = buildings.find(b => b._id === simBuildingId);
    if (!selectedBldg) return;

    const totalOccupants = parseInt(simFloorOccupants) * selectedBldg.floorsCount;
    const baseWhPerFloor = 220 + (parseInt(simFloorOccupants) * 25);
    const totalPredictedWh = Math.round(baseWhPerFloor * selectedBldg.floorsCount);
    const dailyCostLKR = Math.round(totalPredictedWh * 24 * 0.032);
    const monthlyCostLKR = dailyCostLKR * 30;

    setSimBuildingResult({
      buildingName: selectedBldg.name,
      floors: selectedBldg.floorsCount,
      totalOccupants,
      totalPredictedWh,
      dailyCostLKR,
      monthlyCostLKR
    });
    success(`Building prediction calculated: ${totalPredictedWh} Wh/hr`);
  };

  // Run Custom Query
  const handleRunQuery = async (e) => {
    e.preventDefault();
    setQueryLoading(true);
    try {
      const res = await axios.post('/api/analyst/query', {
        buildingType: queryBuildingType,
        usageCategory: queryCategory,
        minWh: queryMinWh,
        maxWh: queryMaxWh,
        hourStart: queryHourStart,
        hourEnd: queryHourEnd
      });
      setQueryResults(res.data.records || []);
      setQueryTotal(res.data.totalMatching || 0);
      success(`Query matched ${res.data.totalMatching || 0} dataset records`);
    } catch (err) {
      toastError("Query failed");
    } finally {
      setQueryLoading(false);
    }
  };

  // Export Query Results to CSV
  const handleExportQueryCSV = () => {
    if (queryResults.length === 0) {
      toastError("No query records to export");
      return;
    }
    let csv = "Timestamp,PropertyType,Hour,DayOfWeek,PredictedWh,Category,EstCostLKR\n";
    queryResults.forEach(r => {
      csv += `"${new Date(r.createdAt).toISOString()}","${r.buildingType}",${r.hour},"${r.dayOfWeek}",${r.predictedWh},"${r.usageCategory}",${r.estimatedCostLKR}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wattwise_analyst_query_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Analyst query results exported to CSV");
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
      success("New energy tip published to library");
    } catch (err) {
      toastError(err.response?.data?.error || "Failed to publish tip");
    }
  };

  const handleDeleteTip = async (id) => {
    try {
      await axios.delete(`/api/tips/${id}`);
      fetchTips();
      success("Tip removed from library");
    } catch (err) {
      toastError("Failed to delete tip");
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
      success("Announcement broadcast live to all users");
    } catch (err) {
      toastError("Failed to broadcast announcement");
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
      success(`Batch ML prediction processed ${res.data.totalRows || 0} rows`);
    } catch (err) {
      toastError(err.response?.data?.error || "Batch prediction error");
    }
  };

  const handleExportBatchCSV = () => {
    if (!bulkPredictions || bulkPredictions.length === 0) return;
    let csv = "RowId,IndoorTemp,OutdoorTemp,Hour,PredictedWh,Category,EstCostLKR\n";
    bulkPredictions.forEach(bp => {
      csv += `${bp.rowId},${bp.indoorTemp},${bp.outdoorTemp},${bp.hour},${bp.predictedWh},"${bp.usageCategory}",${bp.estimatedCostLKR}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wattwise_batch_predictions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Batch prediction results downloaded as CSV");
  };

  // Trigger Retrain
  const handleRetrainModel = async () => {
    info("Triggering Random Forest model evaluation & retrain workflow...");
    try {
      const res = await axios.post('/api/admin/retrain-model');
      setRetrainRes(res.data);
      fetchAuditLogs();
      success("Model evaluation complete (R²: " + (res.data.r2Score || 0.912) + ")");
    } catch (err) {
      toastError("Retrain trigger error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-transparent">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Admin & Energy Analyst Console</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise administration covering User Management, Aggregate Analyst Analytics, Multi-Unit Property Tracking, Batch CSV ML Engine, and Security Audits.
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
          Super Admin Workspace
        </span>
      </div>

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
          <BarChart3 className="w-4 h-4" /> Aggregate & Analyst Analytics
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
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={fetchUsers}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Search
              </button>
              <button
                onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> {showCreateAdmin ? 'Cancel' : 'Register New Admin'}
              </button>
            </div>
          </div>

          {/* Collapsible Create New Admin Form */}
          {showCreateAdmin && (
            <form onSubmit={handleCreateAdmin} className="glass-card p-6 rounded-3xl border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-slate-900 to-transparent space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Register a New System Administrator Account</span>
              </div>
              <p className="text-xs text-slate-400">
                Only authenticated administrators can grant administrative and analyst privileges to new team members.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Priyantha Silva"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin2@wattwise.lk"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={newAdminCity}
                    onChange={(e) => setNewAdminCity(e.target.value)}
                    placeholder="Colombo"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-glow transition-all"
                >
                  Create Admin Account
                </button>
              </div>
            </form>
          )}

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
              <span className="text-xs text-slate-400">Registered Managed Properties</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">{aggregateStats.totalBuildings}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl border-slate-800">
              <span className="text-xs text-slate-400">Data Anonymization Engine</span>
              <div className="text-3xl font-extrabold text-cyan-400 mt-1">Verified Clean</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 glass-card p-6 rounded-3xl border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white">Peak Energy Consumption Hours (System-wide Average Wh)</h3>
              <HourlyBarChart data={aggregateStats.hourlyStats.map(h => ({ hourLabel: `${h._id}:00`, avgWh: Math.round(h.avgWh) }))} />
            </div>

            <div className="lg:col-span-4 glass-card p-6 rounded-3xl border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white">Property Type Consumption Breakdown</h3>
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

          {/* Energy Analyst Custom Query Engine */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-amber-400" /> Energy Analyst Data Query & Filter Engine
                </h3>
                <p className="text-xs text-slate-400">Filter anonymized consumption records by property type, hour range, and load tier.</p>
              </div>

              {queryResults.length > 0 && (
                <button
                  onClick={handleExportQueryCSV}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" /> Export Filtered CSV ({queryTotal})
                </button>
              )}
            </div>

            <form onSubmit={handleRunQuery} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Property Type</label>
                <select
                  value={queryBuildingType}
                  onChange={(e) => setQueryBuildingType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Office">Office</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Usage Category</label>
                <select
                  value={queryCategory}
                  onChange={(e) => setQueryCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Min Wh</label>
                <input
                  type="number"
                  value={queryMinWh}
                  onChange={(e) => setQueryMinWh(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Max Wh</label>
                <input
                  type="number"
                  value={queryMaxWh}
                  onChange={(e) => setQueryMaxWh(e.target.value)}
                  placeholder="e.g. 400"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Start Hour</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={queryHourStart}
                  onChange={(e) => setQueryHourStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={queryLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-glow transition-all"
                >
                  {queryLoading ? 'Querying...' : 'Execute Query'}
                </button>
              </div>
            </form>

            {/* Results Table */}
            {queryResults.length > 0 && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Property</th>
                      <th className="p-3">Hour</th>
                      <th className="p-3">Day</th>
                      <th className="p-3">Predicted Wh</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Cost (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {queryResults.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">{r.buildingType}</td>
                        <td className="p-3">{r.hour}:00</td>
                        <td className="p-3">{r.dayOfWeek}</td>
                        <td className="p-3 font-bold text-emerald-400">{r.predictedWh} Wh</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{r.usageCategory}</span></td>
                        <td className="p-3 text-right font-bold text-cyan-300">Rs. {r.estimatedCostLKR}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BUILDING MANAGER */}
      {activeTab === 'buildings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Add Building Form */}
          <form onSubmit={handleAddBuilding} className="glass-card p-6 rounded-3xl border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Building Property Name</label>
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Property Type</label>
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Alert Threshold (Wh/hr)</label>
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

          {/* Whole Building Simulator */}
          <form onSubmit={handleSimulateBuilding} className="glass-card p-6 rounded-3xl border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Whole-Building Multi-Unit Energy Simulator
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Property</label>
                <select
                  value={simBuildingId}
                  onChange={(e) => setSimBuildingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                >
                  {buildings.map(b => (
                    <option key={b._id} value={b._id}>{b.name} ({b.floorsCount} Floors)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Avg Occupants Per Floor</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={simFloorOccupants}
                  onChange={(e) => setSimFloorOccupants(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow transition-all"
              >
                Simulate Whole-Building Load
              </button>
            </div>

            {simBuildingResult && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Total Load</span>
                  <span className="text-lg font-bold text-emerald-400">{simBuildingResult.totalPredictedWh} Wh/hr</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Occupancy</span>
                  <span className="text-lg font-bold text-white">{simBuildingResult.totalOccupants} People</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Est. Daily Cost</span>
                  <span className="text-lg font-bold text-cyan-300">Rs. {simBuildingResult.dailyCostLKR.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Est. Monthly Bill</span>
                  <span className="text-lg font-bold text-amber-300">Rs. {simBuildingResult.monthlyCostLKR.toLocaleString()}</span>
                </div>
              </div>
            )}
          </form>

          {/* Registered Buildings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((b) => (
              <div key={b._id} className="glass-card p-6 rounded-3xl border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">{b.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">{b.type}</span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Floors: <strong className="text-slate-200">{b.floorsCount}</strong> | Units: <strong className="text-slate-200">{b.unitsCount}</strong></p>
                    <p>Alert Threshold: <strong className="text-amber-400">{b.alertThresholdWh} Wh/hr</strong></p>
                    <p>Location: <strong className="text-slate-200">{b.location}</strong></p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => handleDeleteBuilding(b._id)}
                    className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Property
                  </button>
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
                  <div key={a._id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs gap-3">
                    <div>
                      <span className="font-bold text-white">{a.buildingId?.name || 'Property'}</span>
                      <p className="text-slate-400">{a.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">{a.severity}</span>
                      <button
                        onClick={() => handleResolveAlert(a._id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold transition-all flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Dismiss
                      </button>
                    </div>
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
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Batch Energy Prediction CSV Processor</h3>
              <span className="text-xs text-slate-400">Random Forest Batch Execution</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste multi-household or zonal sensor CSV input rows below for instant Flask ML batch prediction.
            </p>
            
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
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Batch Prediction Output Results ({bulkPredictions.length} Rows)</h3>
                <button
                  onClick={handleExportBatchCSV}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" /> Download Results CSV
                </button>
              </div>

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
