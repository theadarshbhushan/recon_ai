import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('auditor@razorpay.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard/overview', { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        'Login failed. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    setEmail('auditor@razorpay.com');
    setPassword('password123');

    try {
      await login('auditor@razorpay.com', 'password123');
      navigate('/dashboard/overview', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-100">
      {/* Blurred Background Mockup of Landing / Dashboard */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none select-none blur-xl opacity-60 scale-105 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto pt-16 px-6 text-center">
          <div className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-4">
            ✨ Razorpay AI Buildathon 2026
          </div>
          <h1 className="font-outfit font-black text-6xl text-slate-900 max-w-4xl mx-auto mb-6">
            Autonomous Reconciliation for High-Velocity Fintech
          </h1>
          <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
              <div className="text-3xl font-black text-slate-900">4,000+</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Transactions</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
              <div className="text-3xl font-black text-emerald-600">96.94%</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Match Rate</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
              <div className="text-3xl font-black text-amber-600">2,210</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Exceptions</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
              <div className="text-3xl font-black text-indigo-600">0</div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Violations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-0 pointer-events-none"></div>

      {/* Centered Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl rounded-2xl overflow-hidden p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2 group mb-2">
            <span className="text-3xl" role="img" aria-label="dashboard">📊</span>
            <span className="font-outfit font-black text-2xl tracking-tight text-slate-900 flex items-center">
              Recon <span className="text-indigo-600 ml-1">AI</span>
              <span className="flex h-2 w-2 relative ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </span>
          </Link>
          <div className="text-xs text-slate-500 font-medium">
            Sign in to access your autonomous reconciliation workspace
          </div>
        </div>

        {/* Quick Demo Login Pill */}
        <button
          type="button"
          id="demo-login-btn"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full mb-5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <span>⚡ One-Click Demo Sign In (Auditor Access)</span>
        </button>

        <div className="relative flex py-1 items-center mb-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">or sign in with email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold mb-5 flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              id="email-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              type="password"
              id="password-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none transition-all shadow-xs"
            />
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Authenticating JWT...</span>
              </div>
            ) : (
              <span>Sign In to Dashboard →</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1">
            Register Auditor Access
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
