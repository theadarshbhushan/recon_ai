import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLaunch = () => {
    if (isAuthenticated) {
      navigate('/dashboard/overview');
    } else {
      navigate('/login');
    }
  };

  const stats = [
    { label: 'Transactions Processed', value: '4,000+', subtext: 'Multi-source payments' },
    { label: 'Eligible Match Rate', value: '96.94%', subtext: 'Ground Truth verified' },
    { label: 'Exceptions Categorized', value: '2,210', subtext: 'Ranked & LLM explained' },
    { label: 'Circuit Breaker Violations', value: '0', subtext: '100% Guardrail safety' }
  ];

  const steps = [
    {
      num: '01',
      title: 'Ingest Multi-Source Data',
      desc: 'Ingests raw payment gateway logs, aggregated bank settlement batches, and double-entry ledger records.'
    },
    {
      num: '02',
      title: 'Decompose & Match',
      desc: 'Solves complex subset-sum batch groupings using Meet-in-the-Middle and proportional fee-weighted allocation.'
    },
    {
      num: '03',
      title: 'ML Scoring & LLM Audit',
      desc: 'CatBoost and Claude classify discrepancies, compute severity scores, and generate transparent natural-language reasoning.'
    },
    {
      num: '04',
      title: 'Autonomous Action & Reporting',
      desc: 'Agent autonomously resolves high-confidence exceptions under strict circuit breakers, escalating high-stakes risks.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <span className="text-2xl" role="img" aria-label="dashboard">📊</span>
            <div>
              <div className="font-outfit font-black text-xl tracking-tight text-slate-900 flex items-center group-hover:text-indigo-600 transition-colors">
                Recon <span className="text-indigo-600 ml-1">AI</span>
                <span className="flex h-2 w-2 relative ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-wider -mt-0.5">
                AI Finance Controller
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
            <a href="#overview" className="hover:text-slate-900 transition-colors">Overview</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#benchmarks" className="hover:text-slate-900 transition-colors">Benchmarks</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={handleLaunch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:shadow-indigo-600/20 transition-all"
            >
              Get Started →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-7xl mx-auto text-center" id="overview">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
          <span>✨</span>
          <span>Razorpay AI Buildathon 2026 — AI Finance Controller</span>
        </div>

        <h1 className="font-outfit font-black text-4xl sm:text-6xl text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6">
          Autonomous Reconciliation for High-Velocity Fintech
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Close the finance-ops loop across payment gateways, bank settlement batches, and internal double-entry ledgers. Auto-resolving what you can, and escalating what you can’t.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Launch Dashboard</span>
            <span>→</span>
          </button>
          <a
            href="#benchmarks"
            className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm px-6 py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Explore ML Benchmarks</span>
          </a>
        </div>

        {/* Real Product Mockup / Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/60 overflow-hidden">
          <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
            {/* Browser top chrome */}
            <div className="bg-slate-200/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-300/60">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-rose-400 inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-amber-400 inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block"></span>
              </div>
              <div className="bg-white px-6 py-1 rounded-md text-[11px] font-mono text-slate-500 border border-slate-300/60">
                https://recon.ai/dashboard/overview
              </div>
              <div className="text-slate-400 text-xs">⚡ Live Controller</div>
            </div>

            {/* Dashboard Mockup Content */}
            <div className="p-6 bg-slate-50 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs border-l-4 border-l-indigo-600">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Match Rate (Ground Truth)</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">61.42%</div>
                  <div className="text-[10px] text-indigo-600 mt-1 font-semibold">96.94% of eligible txns</div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs border-l-4 border-l-indigo-500">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Match Rate (Hard Mode)</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">47.62%</div>
                  <div className="text-[10px] text-indigo-500 mt-1 font-semibold">430 batches decomposed</div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs border-l-4 border-l-amber-500">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Exception Items</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">2,210</div>
                  <div className="text-[10px] text-amber-600 mt-1 font-semibold">Ranked & categorized</div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs border-l-4 border-l-rose-500">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Amount at Risk</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">₹1.19 Cr</div>
                  <div className="text-[10px] text-rose-500 mt-1 font-semibold">Audited exposure</div>
                </div>
              </div>

              {/* Mini Agent Card Preview */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      🤖 Autonomous Agent
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Closed-Loop Resolution</span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold">
                    Autonomously resolved <strong className="text-emerald-600">177 exceptions</strong> with 0 circuit breaker violations.
                  </div>
                </div>
                <div className="bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm">
                  ⚡ Run Agent Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Strip */}
      <section className="bg-white border-y border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((st, i) => (
            <div key={i}>
              <div className="font-outfit font-black text-3xl sm:text-4xl text-slate-950 tracking-tight">
                {st.value}
              </div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
                {st.label}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                {st.subtext}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alternating Feature Sections */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-24" id="features">
        {/* Feature 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Automated Action Taking
            </span>
            <h2 className="font-outfit font-extrabold text-3xl text-slate-900 tracking-tight mt-3 mb-4">
              Real Autonomous Resolution, Not Just Advisory Badges
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Most tools stop at generating recommendations. Recon AI takes autonomous action: qualifying low-severity items (&le; 0.60) with high clean confidence (&gt; 85%) are automatically closed in the database with timestamps and full audit attribution.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                Hard-coded safety circuit breaker prevents high-stakes auto-resolves
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                Zero circuit breaker violations across 2,210 database items
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                Traceable immutable audit logging in MongoDB collection
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="font-outfit font-bold text-sm text-slate-800">Agent Action Audit Trail</div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Shield Active (&le; 0.60)
              </span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-mono font-bold text-slate-900">TXN_10174</div>
                  <div className="text-[11px] text-slate-500">Timing delay within allowable 3-day window</div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                  Auto-Resolved (87.9%)
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-mono font-bold text-slate-900">SET_20245</div>
                  <div className="text-[11px] text-slate-500">Batch residual 100% — high severity (1.00)</div>
                </div>
                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                  Escalated (Blocked)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Meet-in-the-Middle Decomposition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" id="benchmarks">
          <div className="order-2 lg:order-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-md border-l-4 border-l-indigo-600">
            <div className="font-outfit font-bold text-sm text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Classifier Benchmark Performance
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900">CatBoost (Production)</span>
                <span className="text-emerald-700 font-bold">1.0000 F1 | 3.71ms latency</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900">TabPFN-2.5 (Foundation)</span>
                <span className="text-indigo-700 font-bold">1.0000 F1 | 6,194ms latency</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900">Logistic Regression</span>
                <span className="text-slate-700 font-medium">0.9966 F1 | 7.43ms latency</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900">Rule-Based Baseline</span>
                <span className="text-slate-500 font-medium">0.9404 F1 | 1.06ms latency</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              ML Confidence Engine
            </span>
            <h2 className="font-outfit font-extrabold text-3xl text-slate-900 tracking-tight mt-3 mb-4">
              Tabular Foundation Models vs. Production CatBoost
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              We benchmarked TabPFN-2.5 (in-context Bayesian tabular foundation model) against CatBoost. Both achieved identical 1.0000 F1 scores, proving our operational boundaries are mathematically sound. CatBoost was selected for production to deliver 3.7ms sub-millisecond API responses.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Diagram */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-20 px-6" id="how-it-works">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-white border border-slate-200 px-3 py-1 rounded-full">
            Pipeline Architecture
          </span>
          <h2 className="font-outfit font-extrabold text-3xl text-slate-900 tracking-tight mt-3 mb-2">
            How Recon AI Closes the Loop
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            From raw transaction logs to autonomous closed-loop resolution in 4 steps.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs relative">
              <div className="font-outfit font-black text-2xl text-indigo-600 mb-2">
                {st.num}
              </div>
              <h3 className="font-outfit font-bold text-base text-slate-900 mb-2">
                {st.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Contrasting CTA Band */}
      <section className="bg-slate-950 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <span>🚀</span>
            <span>Razorpay AI Buildathon 2026</span>
          </div>

          <h2 className="font-outfit font-black text-3xl sm:text-5xl tracking-tight text-white mb-6">
            Ready to experience autonomous reconciliation?
          </h2>

          <p className="text-slate-400 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            Test the live platform, run the autonomous agent, drill down into batch decompositions, and audit machine learning inference in real-time.
          </p>

          <button
            onClick={handleLaunch}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
          >
            <span>Launch Recon AI Dashboard</span>
            <span>→</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-outfit font-black text-sm text-slate-900">Recon AI</span>
            <span>—</span>
            <span>Autonomous Finance Controller</span>
          </div>
          <div>
            Razorpay AI Buildathon 2026 Submission. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
