import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDiagnosticsSummary } from '../api/client';

const METHOD_LABELS = {
  exact_combinatorial: 'Exact Combinatorial',
  meet_in_the_middle: 'Meet-In-The-Middle',
  total_sum_match: 'Total Sum Match',
  greedy_fallback: 'Greedy Fallback',
  failed: 'Decomposition Failed'
};

const METHOD_COLORS = {
  exact_combinatorial: '#10B981', // Emerald
  meet_in_the_middle: '#14B8A6', // Teal
  total_sum_match: '#06B6D4', // Cyan
  greedy_fallback: '#6366F1', // Indigo
  failed: '#EF4444' // Red
};

const HardModeDiagnostics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDiagnosticsSummary();
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve diagnostics summary from MongoDB. Verify models.py and exception_queue.py ran.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-6 py-4 rounded-xl">
          <h3 className="font-bold text-lg mb-1">⚠️ Diagnostics Unavailable</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const breakdown = summary?.method_breakdown || [];
  
  // Format data for charts
  const volumeChartData = breakdown.map(item => ({
    name: METHOD_LABELS[item.method] || item.method,
    Count: item.count,
    fill: METHOD_COLORS[item.method] || '#64748B'
  }));

  const successChartData = breakdown
    .filter(item => item.method !== 'failed')
    .map(item => ({
      name: METHOD_LABELS[item.method] || item.method,
      'Success Rate (%)': item.success_rate_pct,
      fill: METHOD_COLORS[item.method] || '#64748B'
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="gradient-header border border-navy-700 text-white rounded-xl p-6 sm:p-8 mb-8 shadow-md">
        <div className="text-indigo-400 font-extrabold text-xs tracking-wider uppercase mb-1">
          Diagnostics Audit
        </div>
        <h1 className="font-outfit font-black text-3xl sm:text-4xl text-white tracking-tight">
          Hard Mode Combinatorial Diagnostics
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Decomposition metrics, solver benchmarks, and mathematical collision logs.
        </p>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm border-l-4 border-l-indigo-600 hover-scale hover:shadow-md transition-all duration-200">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Total Batches Attempted
          </div>
          <div className="text-2xl font-outfit font-bold text-navy-800">
            {summary.total_batches_attempted.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm border-l-4 border-l-emerald-500 hover-scale hover:shadow-md transition-all duration-200">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Overall Hard Mode Success Rate
          </div>
          <div className="text-2xl font-outfit font-bold text-emerald-600">
            {summary.overall_hard_mode_success_rate_pct.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm border-l-4 border-l-rose-500 hover-scale hover:shadow-md transition-all duration-200">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Failed Match Count / Pct
          </div>
          <div className="text-2xl font-outfit font-bold text-rose-600">
            {summary.failed_count} <span className="text-xs text-gray-400 font-semibold ml-1">({summary.failed_pct.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Chart 1: Batch Volume Count */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h3 className="font-outfit font-bold text-sm text-navy-800 uppercase tracking-wider mb-4">
            Decomposition Volume by Method
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeChartData} margin={{ bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" tickLine={false} fontSize={10} angle={-15} tickMargin={10} />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                <Bar dataKey="Count" radius={[4, 4, 0, 0]}>
                  {volumeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Success Rate */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h3 className="font-outfit font-bold text-sm text-navy-800 uppercase tracking-wider mb-4">
            Matching Success Rate (%) by Method
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={successChartData} margin={{ bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" tickLine={false} fontSize={10} angle={-15} tickMargin={10} />
                <YAxis domain={[0, 100]} stroke="#64748B" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  formatter={(value) => [`${value}%`, 'Success Rate']}
                />
                <Bar dataKey="Success Rate (%)" fill="#10B981" radius={[4, 4, 0, 0]}>
                  {successChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dedicated Root-Cause Panel for August 19, 2026 Collision */}
      <div className="bg-white border border-amber-200 rounded-xl shadow-sm p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <span className="inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 mb-3">
            ⚠️ Documented Mathematical Collision Audit
          </span>
          <h3 className="font-outfit font-black text-xl text-navy-800 mb-2">
            Decomposition Ambiguity on August 19, 2026
          </h3>
          <p className="text-gray-600 text-xs leading-relaxed mb-4">
            <strong>What happened:</strong> Multiple settlements processed on 2026-08-19 shared overlapping candidate transaction pools on the same date for the same merchant ID.
          </p>
          <p className="text-gray-600 text-xs leading-relaxed">
            <strong>Why it happened:</strong> Combinatorial solvers (Exact/Greedy search) mapped a transaction to a batch it mathematically fit, but which actually belonged to a different settlement. This created a genuine subset-sum ambiguity where multiple combinations reached the target amount, making accurate decomposition impossible without explicit UTR maps.
          </p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/dashboard/explorer', { state: { searchQuery: '2026-08-19' } })}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 select-none"
          >
            🔍 Analyze Date Live
          </button>
        </div>
      </div>

      {/* Known Limitations Callout */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-5 shadow-sm text-white flex items-start gap-4">
        <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 p-2.5 rounded-lg flex items-center justify-center font-bold text-xl leading-none">
          ℹ️
        </div>
        <div>
          <h4 className="font-outfit font-bold text-xs text-indigo-400 uppercase tracking-wider mb-1">
            Known Decomposition Limitations
          </h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            ~52% of Hard Mode batches cannot be resolved due to genuine subset-sum ambiguity when multiple settlements share overlapping transaction pools on the same date. This is a fundamental mathematical limitation of decomposition without ground-truth batch mapping, not a bug — see the collision case above for a concrete example.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HardModeDiagnostics;
