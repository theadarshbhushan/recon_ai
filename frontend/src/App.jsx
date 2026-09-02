import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Overview from './pages/Overview';
import ModelBenchmarks from './pages/ModelBenchmarks';
import ExceptionQueue from './pages/ExceptionQueue';
import BatchExplorer from './pages/BatchExplorer';
import HardModeDiagnostics from './pages/HardModeDiagnostics';
import LiveDemo from './pages/LiveDemo';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Root & Auth Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected SaaS Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="exceptions" element={<ExceptionQueue />} />
            <Route path="explorer" element={<BatchExplorer />} />
            <Route path="diagnostics" element={<HardModeDiagnostics />} />
            <Route path="benchmarks" element={<ModelBenchmarks />} />
            <Route path="live" element={<LiveDemo />} />
            <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
