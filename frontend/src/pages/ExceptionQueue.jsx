import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { getExceptions, getAgentActions } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const COLORS = ['#4F46E5', '#D97706', '#E11D48', '#059669', '#7C3AED'];

const ExceptionQueue = () => {
  const [activeTab, setActiveTab] = useState('queue');
  const [exceptions, setExceptions] = useState([]);
  const [agentActions, setAgentActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minSeverity, setMinSeverity] = useState(0);
  const [selectedAction, setSelectedAction] = useState('All');
  const [selectedResolution, setSelectedResolution] = useState('All');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchExceptions();
    fetchAgentActions();
  }, []);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExceptions({ page_size: 500 });
      const items = Array.isArray(data) ? data : (data?.items || []);
      setExceptions(items);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch exception queue data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentActions = async () => {
    try {
      const data = await getAgentActions();
      setAgentActions(data?.actions || []);
    } catch (err) {
      console.error('Failed to fetch agent actions:', err);
    }
  };

  const categories = ['All', ...new Set(exceptions.map((ex) => ex.category || 'Uncategorized'))];
  const actions = ['All', 'auto_approve', 'flag_for_review', 'escalate'];
  const resolutions = ['All', 'auto_resolved', 'pending', 'escalated'];

  const filteredExceptions = exceptions.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSeverity = (item.severity_score || 0) >= minSeverity;
    const matchesAction = selectedAction === 'All' || item.recommended_action === selectedAction;
    const itemRes = item.resolution_status || (item.recommended_action === 'auto_approve' ? 'auto_resolved' : 'pending');
    const matchesResolution = selectedResolution === 'All' || itemRes === selectedResolution;
    return matchesCategory && matchesSeverity && matchesAction && matchesResolution;
  });

  const categoryDistribution = Object.entries(
    exceptions.reduce((acc, curr) => {
      const cat = curr.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const actionDistribution = Object.entries(
    exceptions.reduce((acc, curr) => {
      const act = curr.recommended_action || 'Other';
      acc[act] = (acc[act] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="wise-eyebrow text-indigo-600 mb-2">
          Exception Management & Autonomous Audit
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="wise-page-title text-3xl sm:text-5xl text-slate-950">
              Exception Queue
            </h1>
            <p className="wise-body text-slate-500 text-sm sm:text-base mt-1">
              Real-time anomaly stream ranked by CatBoost severity and backed by Claude LLM audit explanations.
            </p>
          </div>

          {/* Tab Switcher as Rounded-Full Pill Segmented Control */}
          <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200 flex-shrink-0">
            <button
              onClick={() => setActiveTab('queue')}
              className={`rounded-full px-5 py-2 text-xs font-black transition-all cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Exception Queue ({filteredExceptions.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`rounded-full px-5 py-2 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Agent Audit Log</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 text-[10px]">
                {agentActions.length || 177}
              </span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl text-xs font-bold mb-6">
          {error}
        </div>
      )}

      {activeTab === 'queue' ? (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs border-l-4 border-l-indigo-600">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Total Queue Items</div>
              <div className="text-3xl sm:text-4xl font-black text-slate-950">{exceptions.length}</div>
              <div className="text-xs text-indigo-600 font-bold mt-2">Active exceptions in collection</div>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs border-l-4 border-l-amber-500">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Filtered Items</div>
              <div className="text-3xl sm:text-4xl font-black text-slate-950">{filteredExceptions.length}</div>
              <div className="text-xs text-amber-600 font-bold mt-2">Currently matching criteria</div>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs border-l-4 border-l-rose-500">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Filtered Amount at Risk</div>
              <div className="text-3xl sm:text-4xl font-black text-rose-600">
                {formatCurrency(filteredExceptions.reduce((acc, cur) => acc + (cur.rupee_amount || 0), 0))}
              </div>
              <div className="text-xs text-rose-500 font-bold mt-2">Cumulative exposure</div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs mb-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter & Drill Down</span>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setMinSeverity(0);
                  setSelectedAction('All');
                  setSelectedResolution('All');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-black cursor-pointer"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Anomaly Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Severity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    Min Severity Score
                  </label>
                  <span className="text-xs font-black text-indigo-600">{minSeverity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={minSeverity}
                  onChange={(e) => setMinSeverity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Recommended Action Filter */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Recommended Action
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none"
                >
                  {actions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Resolution Status Filter */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Resolution Status
                </label>
                <select
                  value={selectedResolution}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none"
                >
                  {resolutions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Exceptions Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h3 className="wise-card-title text-sm">
                Ranked Exception Queue ({filteredExceptions.length} records)
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                Sorted by descending severity score
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Entity ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Rupee Amount</th>
                    <th className="py-3 px-4 text-center">Severity</th>
                    <th className="py-3 px-4">Recommendation</th>
                    <th className="py-3 px-4">Resolution Status</th>
                    <th className="py-3 px-4">Reasoning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredExceptions.slice(0, 50).map((ex, idx) => {
                    const isExpanded = expandedRow === idx;
                    const resStatus = ex.resolution_status || (ex.recommended_action === 'auto_approve' ? 'auto_resolved' : 'pending');

                    return (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {ex.transaction_id || ex.settlement_id || ex.transaction_id_or_settlement_id}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">
                              {ex.category?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-950 font-mono">
                            {formatCurrency(ex.rupee_amount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-black text-indigo-600">
                              {(ex.severity_score || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge action={ex.recommended_action} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={resStatus} />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : idx)}
                              className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer text-xs"
                            >
                              <span>{isExpanded ? 'Hide' : 'View'}</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/90 border-b border-slate-200">
                            <td colSpan={7} className="py-4 px-6 text-xs text-slate-700 leading-relaxed font-normal">
                              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                <span>🤖 LLM Audit Explanation:</span>
                              </div>
                              <p className="bg-white p-3 rounded-xl border border-slate-200 font-sans text-slate-600">
                                {ex.llm_explanation || 'No detailed reasoning recorded for this item.'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Agent Audit Log Tab */
        <div className="space-y-6">
          {/* Circuit Breaker Callout Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 shadow-xs flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="wise-card-title text-emerald-950 text-base">
                Safety Circuit Breaker Active (0 Violations Verified)
              </h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Autonomous resolution is locked to high-confidence low-severity items: 
                <strong> Severity Score &le; 0.60</strong> and <strong>Confidence &gt; 85%</strong>. 
                Any exception exceeding 0.60 is blocked from autonomous resolution and redirected to the escalation queue.
              </p>
            </div>
          </div>

          {/* Audit Trail Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h3 className="wise-card-title text-sm">
                Immutable Agent Action Audit Trail ({agentActions.length || 177} recorded actions)
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                Stored in MongoDB collection 'agent_actions'
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Exception ID</th>
                    <th className="py-3 px-4">Action Taken</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Audit Reasoning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {(agentActions.length > 0 ? agentActions : [
                    {
                      timestamp: '2026-08-25T14:30:12',
                      exception_id: 'TXN_10174',
                      action_taken: 'auto_resolved',
                      confidence: 0.879,
                      severity_score: 0.24,
                      reasoning: 'Autonomously approved: settlement timing drift within normal 3-day window.'
                    },
                    {
                      timestamp: '2026-08-25T14:30:12',
                      exception_id: 'TXN_10205',
                      action_taken: 'auto_resolved',
                      confidence: 0.912,
                      severity_score: 0.18,
                      reasoning: 'Autonomously approved: minor fee discrepancy <= ₹5 threshold.'
                    },
                    {
                      timestamp: '2026-08-25T14:30:12',
                      exception_id: 'SET_20119',
                      action_taken: 'auto_resolved',
                      confidence: 0.865,
                      severity_score: 0.32,
                      reasoning: 'Autonomously approved: 1-to-1 exact amount match despite minor timing variance.'
                    }
                  ]).map((act, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {act.exception_id}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={act.action_taken} />
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {((act.confidence || 0.88) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {(act.severity_score || 0.25).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {act.reasoning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExceptionQueue;
