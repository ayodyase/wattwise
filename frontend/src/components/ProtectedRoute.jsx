import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-sm font-medium">Verifying session token...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 glass-card rounded-2xl border-rose-500/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center font-bold text-xl">
          !
        </div>
        <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
        <p className="text-sm text-slate-300">
          The Admin Console requires System Administrator privileges. Your current role is <span className="font-semibold text-emerald-400">{user.role}</span>.
        </p>
        <div className="pt-2">
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  return children;
}
