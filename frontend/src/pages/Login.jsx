import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard/overview', { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        'Login failed. Please double-check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Brand logo */}
      <Link to="/" className="flex items-center space-x-3 mb-8 group">
        <span className="text-3xl" role="img" aria-label="dashboard">📊</span>
        <div>
          <div className="font-outfit font-extrabold text-2xl tracking-tight text-white flex items-center group-hover:text-indigo-400 transition-colors">
            Recon <span className="text-indigo-500 ml-1">AI</span>
          </div>
          <div className="text-[0.7rem] text-slate-500 font-bold uppercase tracking-wider -mt-0.5">
            AI Finance Controller
          </div>
        </div>
      </Link>

      {/* Form Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8">
        <h2 className="font-outfit font-black text-2xl text-white tracking-tight mb-2">
          Welcome Back
        </h2>
        <p className="text-slate-400 text-xs mb-6">
          Log in to access your financial reconciliation workspace.
        </p>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold mb-6 flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 select-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
