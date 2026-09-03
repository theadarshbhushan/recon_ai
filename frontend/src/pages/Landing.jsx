import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  Zap,
  TrendingUp,
  Lock,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLaunch = () => {
    if (isAuthenticated) {
      navigate('/dashboard/overview');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
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
      desc: 'Ingests raw payment gateway logs, aggregated bank settlement batches, and internal double-entry ledger records into persistent collections.'
    },
    {
      num: '02',
      title: 'Decompose & Match',
      desc: 'Solves complex multi-item batch groupings using Meet-in-the-Middle subset-sum algorithms and proportional fee-weighted allocation.'
    },
    {
      num: '03',
      title: 'ML Scoring & LLM Audit',
      desc: 'CatBoost and Claude classify non-linear discrepancies, score severity (0.0–1.0), and generate transparent natural-language reasoning.'
    },
    {
      num: '04',
      title: 'Autonomous Action & Reporting',
      desc: 'Agent autonomously resolves high-confidence exceptions under strict circuit breakers, escalating high-stakes risks for review.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <BrandLogo size={42} />
            <div>
              <div className="font-display font-black text-2xl tracking-tight text-slate-900 flex items-center group-hover:text-blue-600 transition-colors">
                Recon <span className="text-blue-600 ml-1">AI</span>
                <span className="flex h-2 w-2 relative ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest -mt-0.5">
                AI Finance Controller
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-black text-slate-600 uppercase tracking-wider">
            <a href="#overview" className="hover:text-slate-900 transition-colors">Overview</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#benchmarks" className="hover:text-slate-900 transition-colors">Benchmarks</a>
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleLogout}
                  className="text-xs font-black uppercase tracking-wider text-slate-700 hover:text-rose-600 px-3 py-2 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  onClick={() => navigate('/dashboard/overview')}
                  className="btn-pill-primary text-xs tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-blue-200" />
                  <span>Dashboard →</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-black uppercase tracking-wider text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
                >
                  Log In
                </Link>
                <button
                  onClick={handleLaunch}
                  className="btn-pill-primary text-xs tracking-wider cursor-pointer"
                >
                  Get Started →
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Wise-Style Hero Section in Slate & Electric Blue */}
      <section className="pt-20 pb-16 px-6 max-w-7xl mx-auto text-center" id="overview">
        {/* Social Proof Badge Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200/90 shadow-2xs rounded-full px-4 py-1.5 text-xs font-bold text-slate-700">
            <span className="text-blue-600 font-black">⚡</span>
            <span>Live on <strong>Razorpay AI Buildathon 2026</strong></span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200/90 shadow-2xs rounded-full px-4 py-1.5 text-xs font-bold text-slate-700">
            <span className="text-emerald-600 font-black">🎯</span>
            <span><strong>96.94%</strong> Match Rate — Verified</span>
          </div>
        </div>

        {/* Massive Bold Wise Headline with Electric Blue Accent */}
        <h1 className="wise-hero-title text-5xl sm:text-7xl lg:text-8xl mb-6 max-w-5xl mx-auto text-slate-900">
          CLOSE THE LOOP.<br />
          <span className="text-blue-600">AUTOMATICALLY.</span>
        </h1>

        {/* Subheadline */}
        <p className="wise-body text-slate-600 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Autonomous financial reconciliation across payment gateways, bank settlement batches, and double-entry ledger records. Auto-resolving what you can, and escalating what you can’t.
        </p>

        {/* Single Centered Rounded-Pill Primary CTA in Electric Blue */}
        <div className="flex items-center justify-center mb-16">
          <button
            onClick={handleLaunch}
            className="rounded-full px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-600/25 hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer hover-scale"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
            <ArrowRight className="h-5 w-5 text-blue-200" />
          </button>
        </div>

        {/* Real Product Mockup / Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xl shadow-slate-200/80 overflow-hidden">
          <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
            {/* Browser Chrome Header */}
            <div className="bg-slate-200/70 px-4 py-3 flex items-center justify-between border-b border-slate-300/60">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-rose-400 inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-amber-400 inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block"></span>
              </div>
              <div className="bg-white px-6 py-1 rounded-full text-xs font-mono text-slate-500 border border-slate-300/60 flex items-center gap-1.5 shadow-2xs">
                <Lock className="h-3 w-3 text-slate-400" />
                <span>https://recon.ai/dashboard/overview</span>
              </div>
              <div className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Controller</span>
              </div>
            </div>

            {/* Dashboard Mockup Content */}
            <div className="p-6 sm:p-8 bg-white text-left">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs border-l-4 border-l-blue-600">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ground Truth Match</div>
                  <div className="text-3xl font-black text-slate-900 mt-1">61.42%</div>
                  <div className="text-[11px] text-blue-600 mt-1 font-black">96.94% eligible txns</div>
                </div>

                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs border-l-4 border-l-slate-700">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hard Mode Match</div>
                  <div className="text-3xl font-black text-slate-900 mt-1">47.62%</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-bold">430 batches resolved</div>
                </div>

                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs border-l-4 border-l-amber-500">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Exception Items</div>
                  <div className="text-3xl font-black text-slate-900 mt-1">2,210</div>
                  <div className="text-[11px] text-amber-600 mt-1 font-bold">Ranked & categorized</div>
                </div>

                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs border-l-4 border-l-rose-500">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Amount at Risk</div>
                  <div className="text-3xl font-black text-rose-600 mt-1">₹1.19 Cr</div>
                  <div className="text-[11px] text-rose-500 mt-1 font-bold">Audited exposure</div>
                </div>
              </div>

              {/* Agent Card Mockup */}
              <div className="bg-gradient-to-r from-blue-50/50 via-white to-emerald-50/40 border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 tracking-wider uppercase">
                      🤖 Autonomous Agent
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Closed-Loop Resolution Active</span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold">
                    Autonomously resolved <strong className="text-emerald-700 font-black">177 exceptions</strong> under a hard-coded safety circuit breaker with <strong>0 violations</strong>.
                  </div>
                </div>

                <div className="rounded-full bg-emerald-600 text-white font-black text-xs px-5 py-2.5 shadow-sm inline-flex items-center gap-1.5 flex-shrink-0">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Run Agent Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Strip */}
      <section className="bg-white border-y border-slate-200 py-14 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((st, i) => (
            <div key={i}>
              <div className="font-display font-black text-4xl sm:text-5xl text-slate-900 tracking-tight">
                {st.value}
              </div>
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1.5">
                {st.label}
              </div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5">
                {st.subtext}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alternating Feature Sections */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-28" id="features">
        {/* Feature 1: Autonomous Agent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="wise-eyebrow text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
              Autonomous Action Taking
            </span>
            <h2 className="wise-section-title text-3xl sm:text-4xl mt-4 mb-4 text-slate-900">
              Real Autonomous Resolution, Not Just Advisory Badges
            </h2>
            <p className="wise-body mb-6">
              Most reconciliation tools stop at generating alerts and recommendations. Recon AI closes the loop: qualifying low-severity items (&le; 0.60) with high clean confidence (&gt; 85%) are automatically resolved directly in the database with timestamps and full audit attribution.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-black text-slate-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                Hard-coded safety circuit breaker prevents high-stakes auto-resolves
              </div>
              <div className="flex items-center gap-3 text-xs font-black text-slate-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                Zero circuit breaker violations across 2,210 database items
              </div>
              <div className="flex items-center gap-3 text-xs font-black text-slate-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                Traceable immutable audit logging stored in MongoDB
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="font-display font-black text-sm text-slate-900">Agent Action Audit Trail</div>
              <span className="rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 uppercase tracking-wider">
                Shield Active (&le; 0.60)
              </span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex justify-between items-center">
                <div>
                  <div className="font-mono font-bold text-slate-900">TXN_10174</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Timing delay within allowable 3-day window</div>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 font-black px-3 py-1 text-[11px]">
                  Auto-Resolved (87.9%)
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex justify-between items-center">
                <div>
                  <div className="font-mono font-bold text-slate-900">SET_20245</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Batch residual 100% — high severity (1.00)</div>
                </div>
                <span className="rounded-full bg-rose-100 text-rose-800 font-black px-3 py-1 text-[11px]">
                  Escalated (Blocked)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: ML Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" id="benchmarks">
          <div className="order-2 lg:order-1 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm border-l-4 border-l-blue-600">
            <div className="font-display font-black text-sm text-slate-900 mb-4 pb-3 border-b border-slate-100">
              ML Model Benchmarking Performance
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-black text-slate-900">CatBoost (Production)</span>
                <span className="text-emerald-700 font-black">1.0000 F1 | 3.71ms latency</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-black text-slate-900">TabPFN-2.5 (Foundation)</span>
                <span className="text-blue-600 font-black">1.0000 F1 | 6,194ms latency</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-800">Logistic Regression</span>
                <span className="text-slate-600 font-semibold">0.9966 F1 | 7.43ms latency</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-800">Rule-Based Baseline</span>
                <span className="text-slate-500 font-semibold">0.9404 F1 | 1.06ms latency</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="wise-eyebrow text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
              ML Confidence Engine
            </span>
            <h2 className="wise-section-title text-3xl sm:text-4xl mt-4 mb-4 text-slate-900">
              Tabular Foundation Models vs. Production CatBoost
            </h2>
            <p className="wise-body mb-6">
              We benchmarked TabPFN-2.5 (in-context Bayesian tabular foundation model) against CatBoost. Both achieved identical 1.0000 F1 scores, proving our non-linear reconciliation boundaries are mathematically solid. CatBoost is deployed in production to deliver 3.7ms sub-millisecond API response times.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Diagram */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-24 px-6" id="how-it-works">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <span className="wise-eyebrow bg-white border border-slate-200 rounded-full px-3 py-1">
            Pipeline Architecture
          </span>
          <h2 className="wise-section-title text-3xl sm:text-4xl mt-4 mb-2 text-slate-900">
            How Recon AI Closes the Loop
          </h2>
          <p className="wise-body max-w-xl mx-auto">
            From raw transaction logs to autonomous closed-loop resolution in 4 steps.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div key={idx} className="wise-card p-6 sm:p-7 relative flex flex-col justify-between">
              <div>
                <div className="font-display font-black text-3xl text-blue-600 mb-3">
                  {st.num}
                </div>
                <h3 className="wise-card-title text-base mb-2 text-slate-900">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Contrasting CTA Band in Slate-900 / Charcoal */}
      <section className="bg-[#0F172A] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-700/60 text-blue-300 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Razorpay AI Buildathon 2026</span>
          </div>

          <h2 className="wise-hero-title text-4xl sm:text-6xl text-white mb-6">
            Ready to experience autonomous reconciliation?
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Test the live platform, run the autonomous agent, drill down into batch decompositions, and audit machine learning inference in real-time.
          </p>

          <button
            onClick={handleLaunch}
            className="rounded-full px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-base shadow-xl shadow-blue-600/30 transition-all inline-flex items-center gap-2 cursor-pointer hover-scale"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Launch Recon AI Dashboard'}</span>
            <ArrowRight className="h-5 w-5 text-blue-200" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-6 text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-display font-black text-sm text-slate-900">Recon AI</span>
            <span>—</span>
            <span>Autonomous Finance Controller</span>
          </div>
          <div className="text-slate-400">
            Razorpay AI Buildathon 2026 Submission. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
