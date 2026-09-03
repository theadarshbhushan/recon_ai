import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await register(email, password, fullName);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Registration failed. Please make sure the email is valid.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-100">
      {/* Blurred Background Layer */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none select-none blur-xl opacity-60 scale-105 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto pt-20 px-6 text-center">
          <div className="inline-block bg-white border border-slate-200 shadow-xs rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 mb-6">
            ⚡ Live on Razorpay AI Buildathon 2026
          </div>
          <h1 className="wise-hero-title text-7xl text-slate-950 max-w-4xl mx-auto mb-6">
            CLOSE THE LOOP.<br />AUTOMATICALLY.
          </h1>
        </div>
      </div>

      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm z-0 pointer-events-none"></div>

      {/* Centered Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl rounded-2xl overflow-hidden p-8 sm:p-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2 group mb-3">
            <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-slate-950 flex items-center">
              Recon <span className="text-indigo-600 ml-1">AI</span>
              <span className="flex h-2 w-2 relative ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </span>
          </Link>
          <h2 className="font-display font-black text-2xl text-slate-950 tracking-tight">
            Create your account
          </h2>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Register your auditor credentials for closed-loop controller access
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold mb-6 flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold mb-6 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Account created! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Adarsh Auditor"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="auditor@company.com"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-2 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-sm py-3.5 px-6 shadow-md hover:shadow-lg hover:shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500 font-semibold">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-black ml-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
