import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    setLoading(true);
    // Simulate a premium loading state before redirecting to the dashboard
    setTimeout(() => {
      if (isAuthenticated) {
        navigate('/dashboard/overview');
      } else {
        navigate('/login');
      }
    }, 1000);
  };

  const features = [
    {
      icon: '⚙️',
      title: '3-Stage Matching Engine',
      description: 'Combinatorial algorithms matching complex batch payouts to individual ledger items with exact, meet-in-the-middle, and greedy heuristic fallbacks.'
    },
    {
      icon: '📊',
      title: '4-Model ML Benchmarks',
      description: 'Robust benchmarking models (CatBoost, Random Forest, XGBoost, and TabPFN-2.5) evaluated on real financial latency and precision records.'
    },
    {
      icon: '🧠',
      title: 'Claude-Powered Explanations',
      description: 'Live Anthropic Claude-3 model integrations auditing discrepancies to generate plain-English explanations and recommended actions.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between overflow-hidden relative selection:bg-indigo-500/30">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none"></div>

      {/* Header / Brand */}
      <header className="max-w-7xl mx-auto px-6 w-full h-20 flex items-center justify-between z-10 border-b border-slate-900/55">
        <div className="flex items-center space-x-3">
          <span className="text-2xl" role="img" aria-label="dashboard">📊</span>
          <div>
            <div className="font-outfit font-extrabold text-xl tracking-tight text-white flex items-center">
              Recon <span className="text-indigo-500 ml-1">AI</span>
            </div>
            <div className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider -mt-0.5">
              AI Finance Controller
            </div>
          </div>
        </div>
        <div>
          <span className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-slate-300">
            🚀 Buildathon 2026
          </span>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-grow flex flex-col items-center justify-center text-center z-10">
        {/* Buildathon Badge */}
        <div className="mb-6 animate-fade-in">
          <span className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-widest">
            <span>✨</span>
            <span>Razorpay AI Buildathon 2026 Submission</span>
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-outfit font-black text-4xl sm:text-6xl tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          AI-Powered Multi-Source <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Reconciliation Engine
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-slate-400 text-sm sm:text-lg max-w-2xl font-medium mb-10 leading-relaxed">
          Audit transaction splits, reconcile ledger journals, identify processing timing drifts, and explain batch decomposition anomalies with state-of-the-art machine learning models.
        </p>

        {/* Action Button & Loader */}
        <div className="mb-16 w-full max-w-xs flex flex-col items-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
              <span className="text-xs text-indigo-400 font-bold tracking-wider uppercase animate-pulse">
                Initializing controller modules...
              </span>
            </div>
          ) : (
            <button
              onClick={handleGetStarted}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-xl shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started &rarr;
            </button>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-slate-900/60 border border-slate-900 rounded-2xl p-6 hover:border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/[0.02]"
            >
              <div className="text-2xl mb-4 bg-slate-950 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-800">
                {f.icon}
              </div>
              <h3 className="font-outfit font-extrabold text-sm text-white mb-2 uppercase tracking-wide">
                {f.title}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-slate-900/40 z-10 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
        © {new Date().getFullYear()} Recon AI • Developed for Razorpay AI Buildathon 2026
      </footer>
    </div>
  );
};

export default Landing;
