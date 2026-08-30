import React, { useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2 } from 'lucide-react';

function AdminRejectRedirect({ userRole }) {
  const { error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    toastError(`Access Restricted: Administrator privileges required. Your current role is ${userRole}.`);
    // Redirect imperatively after triggering the toast
    navigate('/dashboard', { replace: true });
  }, [toastError, userRole, navigate]);

  return null;
}

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
    return <AdminRejectRedirect userRole={user.role} />;
  }

  return children;
}
