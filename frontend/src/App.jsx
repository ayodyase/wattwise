import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import PredictorPage from './pages/User/PredictorPage';
import BillEstimatorPage from './pages/User/BillEstimatorPage';
import UserDashboardPage from './pages/User/UserDashboardPage';
import PredictionHistoryPage from './pages/User/PredictionHistoryPage';
import TipsLibraryPage from './pages/User/TipsLibraryPage';
import ProfilePage from './pages/User/ProfilePage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 font-sans">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/bill-estimator" element={<BillEstimatorPage />} />
              <Route path="/tips" element={<TipsLibraryPage />} />

              {/* Protected User Routes */}
              <Route
                path="/predict"
                element={
                  <ProtectedRoute>
                    <PredictorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <PredictionHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Console (Admin Only) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
