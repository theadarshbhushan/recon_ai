import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 animate-bounce">
          <span className="text-base">✅</span>
          <span className="font-semibold text-xs">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="text-indigo-600 font-extrabold text-[11px] tracking-wider uppercase mb-1">
          Reconciliation Workspace
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Executive Reconciliation Overview
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Monitor matching rates across banking, ledger, and payment gateway logs in real-time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Mode Select */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={() => setMode('ground_truth')}
                disabled={reconciling}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'ground_truth'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ground Truth
              </button>
              <button
                onClick={() => setMode('hard')}
                disabled={reconciling}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'hard'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Hard Mode
              </button>
            </div>

            {/* Action Button */}
            <button
              onClick={handleReconcile}
              disabled={reconciling}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {reconciling ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>🔄 Re-run Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold mb-6 flex items-center space-x-2">
          <span>⚠️</span>
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
          subtextColor="text-indigo-600"
        />
        <KpiCard
          title="Overall Match Rate (Hard Mode)"
          value={getPercentString(data?.match_rate_hard_mode_pct)}
          borderClass="border-l-indigo-500"
          subtext="Match accuracy solved by subset-sum algorithm"
          subtextColor="text-indigo-500"
        />
        <KpiCard
          title="Total Exception Items"
          value={data?.total_exceptions?.toLocaleString() || '0'}
          borderClass="border-l-amber-500"
          subtext="Total unresolved transaction deviations"
          subtextColor="text-amber-600"
        />
        <KpiCard
          title="Total Rupee Amount at Risk"
          value={formatCurrency(data?.total_rupee_amount_at_risk || 0)}
          borderClass="border-l-rose-500"
          subtext="Potential financial exposure / audits flagged"
          subtextColor="text-rose-600"
        />
      </div>

      {/* Autonomous Agent Activity Card */}
      <div className="bg-gradient-to-r from-indigo-50/40 via-white to-emerald-50/30 border border-slate-200/90 rounded-2xl p-6 sm:p-7 mb-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                🤖 Autonomous AI Agent
              </span>
              <span className="text-slate-400 text-xs font-medium">Closed-Loop Resolution</span>
            </div>
            <h3 className="font-outfit font-black text-xl text-slate-900 tracking-tight">
              Agent Activity & Autonomous Exception Clearance
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Agent autonomously resolved{' '}
              <strong className="text-emerald-700 font-extrabold">
                {data?.agent_activity?.auto_resolved?.toLocaleString() || 177}
              </strong>{' '}
              of{' '}
              <strong className="text-slate-900 font-extrabold">
                {data?.total_exceptions?.toLocaleString() || 2210}
              </strong>{' '}
              exceptions (
              <span className="text-emerald-700 font-bold">
                {data?.agent_activity?.resolution_rate_pct || 8.0}%
              </span>
              ) —{' '}
              <span className="text-amber-700 font-semibold">
                {data?.agent_activity?.pending_review?.toLocaleString() || 658}
              </span>{' '}
              require human review, and{' '}
              <span className="text-rose-700 font-semibold">
                {data?.agent_activity?.escalated?.toLocaleString() || 1375}
              </span>{' '}
              escalated.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-slate-500 font-medium">Auto-Resolved:</span>
                <span className="text-xs font-bold text-emerald-700">
                  {data?.agent_activity?.auto_resolved?.toLocaleString() || 177}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="text-xs text-slate-500 font-medium">Pending Review:</span>
                <span className="text-xs font-bold text-amber-700">
                  {data?.agent_activity?.pending_review?.toLocaleString() || 658}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span className="text-xs text-slate-500 font-medium">Escalated:</span>
                <span className="text-xs font-bold text-rose-700">
                  {data?.agent_activity?.escalated?.toLocaleString() || 1375}
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleRunAgent}
              disabled={agentRunning}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {agentRunning ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  <span>Agent Resolving...</span>
                </>
              ) : (
                <>
                  <span>⚡ Run Agent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Transaction Volume Chart */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-outfit font-bold text-base text-slate-900">
              Daily Transaction Volume and Payouts
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Aggregated payment volume across gateway logs
            </p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-100">
            INR Volume
          </span>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getChartData()} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
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
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#4F46E5" 
                strokeWidth={2} 
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
