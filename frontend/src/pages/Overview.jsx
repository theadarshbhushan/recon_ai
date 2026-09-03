import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getSummary, reconcile, runAgent } from '../api/client';
import KpiCard from '../components/KpiCard';

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('ground_truth');
  const [toast, setToast] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const summaryData = await getSummary();
      setData(summaryData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch summary data from the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleReconcile = async () => {
    try {
      setReconciling(true);
      setError(null);
      const result = await reconcile(mode);
      showToast(`Pipeline execution successful (${mode} mode)!`);
      await fetchSummary();
    } catch (err) {
      console.error(err);
      setError(`Reconciliation pipeline execution failed: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setReconciling(false);
    }
  };

  const handleRunAgent = async () => {
    try {
      setAgentRunning(true);
      setError(null);
      const res = await runAgent();
      showToast(`Autonomous Agent resolved ${res.auto_resolved_count} exceptions (${res.circuit_breaker_blocks} circuit breaker blocks)!`);
      await fetchSummary();
    } catch (err) {
      console.error(err);
      setError(`Autonomous agent execution failed: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setAgentRunning(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  const getPercentString = (val) => {
    return `${(val || 0).toFixed(2)}%`;
  };

  const getChartData = () => {
    if (data?.daily_sales && data.daily_sales.length > 0) {
      return data.daily_sales;
    }
    return [
      { date: '2026-08-15', volume: 450000 },
      { date: '2026-08-16', volume: 520000 },
      { date: '2026-08-17', volume: 490000 },
      { date: '2026-08-18', volume: 680000 },
      { date: '2026-08-19', volume: 720000 },
      { date: '2026-08-20', volume: 810000 },
      { date: '2026-08-21', volume: 750000 }
    ];
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-full bg-emerald-600 text-white px-5 py-3 shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-bold text-xs">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="wise-eyebrow text-indigo-600 mb-2">
          Reconciliation Workspace
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="wise-page-title text-3xl sm:text-5xl text-slate-950">
              Overview
            </h1>
            <p className="wise-body text-slate-500 text-sm sm:text-base mt-1">
              Monitor three-way matching rates across banking, ledger, and payment gateway logs in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Select as Rounded-Full Pill */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
              <button
                onClick={() => setMode('ground_truth')}
                disabled={reconciling}
                className={`rounded-full px-4 py-1.5 text-xs font-black transition-all cursor-pointer ${
                  mode === 'ground_truth'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ground Truth
              </button>
              <button
                onClick={() => setMode('hard')}
                disabled={reconciling}
                className={`rounded-full px-4 py-1.5 text-xs font-black transition-all cursor-pointer ${
                  mode === 'hard'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Hard Mode
              </button>
            </div>

            {/* Re-run Pipeline Rounded-Full Pill Button */}
            <button
              onClick={handleReconcile}
              disabled={reconciling}
              className="btn-pill-primary text-xs tracking-wider"
            >
              {reconciling ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Re-run Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl text-xs font-bold mb-6 flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Overall Match Rate (Ground Truth)"
          value={getPercentString(data?.match_rate_ground_truth_pct)}
          borderClass="border-l-indigo-600"
          subtext="Match accuracy based on batch constituent lists"
          subtextColor="text-indigo-600 font-bold"
        />
        <KpiCard
          title="Overall Match Rate (Hard Mode)"
          value={getPercentString(data?.match_rate_hard_mode_pct)}
          borderClass="border-l-indigo-500"
          subtext="Match accuracy solved by subset-sum algorithm"
          subtextColor="text-indigo-500 font-bold"
        />
        <KpiCard
          title="Total Exception Items"
          value={data?.total_exceptions?.toLocaleString() || '0'}
          borderClass="border-l-amber-500"
          subtext="Total unresolved transaction deviations"
          subtextColor="text-amber-600 font-bold"
        />
        <KpiCard
          title="Total Rupee Amount at Risk"
          value={formatCurrency(data?.total_rupee_amount_at_risk || 0)}
          borderClass="border-l-rose-500"
          subtext="Potential financial exposure / audits flagged"
          subtextColor="text-rose-600 font-bold"
        />
      </div>

      {/* Autonomous Agent Activity Card */}
      <div className="bg-gradient-to-r from-indigo-50/50 via-white to-emerald-50/40 border border-slate-200/90 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-black uppercase tracking-widest px-3 py-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                🤖 Autonomous AI Agent
              </span>
              <span className="text-slate-500 text-xs font-semibold">Closed-Loop Resolution</span>
            </div>
            <h3 className="wise-section-title text-2xl sm:text-3xl text-slate-950 mt-2">
              Agent Activity & Autonomous Exception Clearance
            </h3>
            <p className="wise-body text-slate-600 text-sm mt-2 max-w-2xl leading-relaxed">
              Agent autonomously resolved{' '}
              <strong className="text-emerald-700 font-black">
                {data?.agent_activity?.auto_resolved?.toLocaleString() || 177}
              </strong>{' '}
              of{' '}
              <strong className="text-slate-950 font-black">
                {data?.total_exceptions?.toLocaleString() || 2210}
              </strong>{' '}
              exceptions (
              <span className="text-emerald-700 font-black">
                {data?.agent_activity?.resolution_rate_pct || 8.0}%
              </span>
              ) —{' '}
              <span className="text-amber-700 font-bold">
                {data?.agent_activity?.pending_review?.toLocaleString() || 658}
              </span>{' '}
              require human review, and{' '}
              <span className="text-rose-700 font-bold">
                {data?.agent_activity?.escalated?.toLocaleString() || 1375}
              </span>{' '}
              escalated.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="rounded-full bg-white border border-slate-200 px-4 py-1.5 flex items-center gap-2 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-slate-500 font-medium">Auto-Resolved:</span>
                <span className="text-xs font-black text-emerald-700">
                  {data?.agent_activity?.auto_resolved?.toLocaleString() || 177}
                </span>
              </div>

              <div className="rounded-full bg-white border border-slate-200 px-4 py-1.5 flex items-center gap-2 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="text-xs text-slate-500 font-medium">Pending Review:</span>
                <span className="text-xs font-black text-amber-700">
                  {data?.agent_activity?.pending_review?.toLocaleString() || 658}
                </span>
              </div>

              <div className="rounded-full bg-white border border-slate-200 px-4 py-1.5 flex items-center gap-2 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span className="text-xs text-slate-500 font-medium">Escalated:</span>
                <span className="text-xs font-black text-rose-700">
                  {data?.agent_activity?.escalated?.toLocaleString() || 1375}
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleRunAgent}
              disabled={agentRunning}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider py-3.5 px-7 shadow-md hover:shadow-lg hover:shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover-scale"
            >
              {agentRunning ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  <span>Agent Resolving...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Run Agent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Transaction Volume Chart */}
      <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-xs mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="wise-card-title text-base sm:text-lg">
              Daily Transaction Volume and Payouts
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Aggregated settlement payment volume across gateway logs
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 text-indigo-700 text-xs font-black px-3 py-1 border border-indigo-100 uppercase tracking-wider">
            INR Volume
          </span>
        </div>

        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getChartData()} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                stroke="#94A3B8" 
                fontSize={11} 
                tickMargin={10}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                stroke="#94A3B8" 
                fontSize={11} 
                tickFormatter={(tick) => `₹${(tick / 1000).toFixed(0)}k`} 
                tickMargin={10}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Sales Volume']}
                labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#4F46E5" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorVolume)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;
