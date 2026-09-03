import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { getExceptions, getAgentActions } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const CATEGORY_LABELS = {
  missing_settlement: 'Missing Settlement',
  likely_fee_mismatch: 'Likely Fee Mismatch',
  likely_batch_decomposition_error: 'Batch Decomposition Error',
  timing_drift: 'Timing Drift',
  duplicate_ledger_entry: 'Duplicate Ledger Entry',
  likely_refund_timing_anomaly: 'Refund Timing Anomaly',
  unexplained: 'Unexplained Mismatch'
};

const CATEGORY_COLORS = {
  missing_settlement: '#6366F1', // Indigo
  likely_fee_mismatch: '#3B82F6', // Blue
  likely_batch_decomposition_error: '#EF4444', // Red
  timing_drift: '#8B5CF6', // Purple
  duplicate_ledger_entry: '#EC4899', // Pink
  likely_refund_timing_anomaly: '#F59E0B', // Amber
  unexplained: '#64748B' // Slate
};

const ACTION_COLORS = {
  auto_approve: '#10B981', // Green
  flag_for_review: '#F59E0B', // Amber
  escalate: '#EF4444' // Red
};

const ExceptionQueue = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  
  // Tab State: 'queue' vs 'audit_log'
  const [activeTab, setActiveTab] = useState('queue');

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState(Object.keys(CATEGORY_LABELS));
  const [minSeverity, setMinSeverity] = useState(0.0);
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedResolutionStatus, setSelectedResolutionStatus] = useState('all');

  // Sorting State
  const [sortField, setSortField] = useState('severity_score');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination State for Exceptions
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Expanded explanations state
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Agent Audit Log State
  const [auditActions, setAuditActions] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(25);
  const [auditTotal, setAuditTotal] = useState(0);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getExceptions({ page: 1, page_size: 2500 });
      setExceptions(response.items || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch exception queue from backend.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditActions = async (page = 1) => {
    try {
      setAuditLoading(true);
      const res = await getAgentActions(page, auditPageSize);
      setAuditActions(res.items || []);
      setAuditTotal(res.total || 0);
      setAuditPage(page);
    } catch (err) {
      console.error('Failed to fetch agent audit trail:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
    fetchAuditActions(1);
  }, []);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
    setCurrentPage(1);
  };

  const toggleRowExpand = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredExceptions = exceptions.filter(item => {
    if (!selectedCategories.includes(item.category)) return false;
    if ((item.severity_score || 0) < minSeverity) return false;
    if (selectedAction !== 'all' && item.recommended_action !== selectedAction) return false;
    if (selectedResolutionStatus !== 'all') {
      const status = item.resolution_status || 'pending';
      if (status !== selectedResolutionStatus) return false;
    }
    return true;
  });

  const sortedExceptions = [...filteredExceptions].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (aVal === undefined || aVal === null) aVal = 0;
    if (bVal === undefined || bVal === null) bVal = 0;
    return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const offset = (currentPage - 1) * pageSize;
  const paginatedExceptions = sortedExceptions.slice(offset, offset + pageSize);
  const totalPages = Math.ceil(sortedExceptions.length / pageSize) || 1;
  const totalRupeeRisk = filteredExceptions.reduce((sum, item) => sum + (item.rupee_amount || 0), 0);

  const categoryCounts = filteredExceptions.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoryCounts).map(catKey => ({
    name: CATEGORY_LABELS[catKey] || catKey,
    value: categoryCounts[catKey],
    color: CATEGORY_COLORS[catKey] || '#64748B'
  }));

  const actionCounts = filteredExceptions.reduce((acc, item) => {
    acc[item.recommended_action] = (acc[item.recommended_action] || 0) + 1;
    return acc;
  }, {});

  const actionChartData = [
    { name: 'Auto Approve', count: actionCounts.auto_approve || 0, fill: ACTION_COLORS.auto_approve },
    { name: 'Flag For Review', count: actionCounts.flag_for_review || 0, fill: ACTION_COLORS.flag_for_review },
    { name: 'Escalate', count: actionCounts.escalate || 0, fill: ACTION_COLORS.escalate }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-6 py-4 rounded-xl">
          <h3 className="font-bold text-sm mb-1">⚠️ Error Loading Exceptions</h3>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 mb-6 shadow-xs">
        <div className="text-indigo-600 font-extrabold text-[11px] tracking-wider uppercase mb-1">
          Audit & Action Center
        </div>
        <h1 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Unified Exception Queue
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Ranked, categorized anomalies and autonomous closed-loop resolution actions.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-4 font-outfit text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'queue'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <span>⚠️ Exception Queue</span>
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {filteredExceptions.length.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('audit_log');
            fetchAuditActions(1);
          }}
          className={`pb-3 px-4 font-outfit text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit_log'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <span>🤖 Agent Audit Log</span>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            {auditTotal.toLocaleString()} Resolved
          </span>
        </button>
      </div>

      {/* TAB 1: EXCEPTION QUEUE */}
      {activeTab === 'queue' && (
        <>
          {/* Filter and Controls Panel */}
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Exception Category
              </label>
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-2">
                {Object.keys(CATEGORY_LABELS).map((catKey) => (
                  <label key={catKey} className="flex items-center space-x-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(catKey)}
                      onChange={() => handleCategoryToggle(catKey)}
                      className="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span className="text-slate-700 font-medium text-[11px]">{CATEGORY_LABELS[catKey]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Min Severity: <span className="text-indigo-600 text-xs font-black ml-1">{minSeverity.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={minSeverity}
                  onChange={(e) => {
                    setMinSeverity(parseFloat(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1.5 uppercase">
                  <span>0.0 (Low)</span>
                  <span>1.0 (Critical)</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    setSelectedCategories(Object.keys(CATEGORY_LABELS));
                    setMinSeverity(0.0);
                    setSelectedAction('all');
                    setSelectedResolutionStatus('all');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  🧹 Reset Filters
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Recommended Action
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Actions' },
                  { id: 'auto_approve', label: '✅ Auto Approve' },
                  { id: 'flag_for_review', label: '⚠️ Flag For Review' },
                  { id: 'escalate', label: '🚨 Escalate' }
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center space-x-2 text-xs cursor-pointer select-none">
                    <input
                      type="radio"
                      name="actionFilter"
                      checked={selectedAction === opt.id}
                      onChange={() => {
                        setSelectedAction(opt.id);
                        setCurrentPage(1);
                      }}
                      className="text-indigo-600 border-slate-300 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span className="text-slate-700 font-medium text-[11px]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Resolution Status
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Statuses' },
                  { id: 'auto_resolved', label: '✅ Auto-Resolved' },
                  { id: 'pending', label: '⏳ Pending Review' },
                  { id: 'escalated', label: '🚨 Escalated' }
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center space-x-2 text-xs cursor-pointer select-none">
                    <input
                      type="radio"
                      name="resolutionFilter"
                      checked={selectedResolutionStatus === opt.id}
                      onChange={() => {
                        setSelectedResolutionStatus(opt.id);
                        setCurrentPage(1);
                      }}
                      className="text-indigo-600 border-slate-300 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span className="text-slate-700 font-medium text-[11px]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs border-l-4 border-l-amber-500 flex justify-between items-center">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Filtered Exceptions Shown
                </div>
                <div className="text-2xl font-outfit font-black text-slate-900">
                  {filteredExceptions.length.toLocaleString()} items
                </div>
              </div>
              <span className="text-2xl">⚠️</span>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs border-l-4 border-l-rose-500 flex justify-between items-center">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Filtered Rupee Amount at Risk
                </div>
                <div className="text-2xl font-outfit font-black text-rose-600">
                  {formatCurrency(totalRupeeRisk)}
                </div>
              </div>
              <span className="text-2xl">💸</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col">
              <h4 className="font-outfit font-bold text-sm text-slate-900 mb-4">
                Exception Categories Distribution
              </h4>
              <div className="h-[240px] flex items-center justify-center">
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-xs font-semibold">No data matching filters</div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4 text-[10px] font-bold text-slate-500 uppercase">
                {categoryChartData.map(entry => (
                  <div key={entry.name} className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
              <h4 className="font-outfit font-bold text-sm text-slate-900 mb-4">
                Exceptions by Recommended Action
              </h4>
              <div className="h-[240px]">
                {filteredExceptions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={actionChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} fontSize={11} tickMargin={8} />
                      <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} fontSize={11} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={45}>
                        {actionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">No data matching filters</div>
                )}
              </div>
              <div className="h-2" />
            </div>
          </div>

          {/* Exceptions Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mb-8">
            <div className="overflow-x-auto">
              {sortedExceptions.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5 text-left">Rank</th>
                      <th className="px-6 py-3.5 text-left">Transaction ID</th>
                      <th className="px-6 py-3.5 text-left">Category</th>
                      <th 
                        className="px-6 py-3.5 text-left cursor-pointer hover:bg-slate-100 transition-colors select-none"
                        onClick={() => handleSort('severity_score')}
                      >
                        Severity {sortField === 'severity_score' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                      </th>
                      <th 
                        className="px-6 py-3.5 text-left cursor-pointer hover:bg-slate-100 transition-colors select-none"
                        onClick={() => handleSort('rupee_amount')}
                      >
                        Amount {sortField === 'rupee_amount' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                      </th>
                      <th className="px-6 py-3.5 text-left">Resolution Status</th>
                      <th className="px-6 py-3.5 text-left w-[30%]">LLM Explanation</th>
                      <th className="px-6 py-3.5 text-left">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paginatedExceptions.map((row) => {
                      const isExpanded = expandedRows.has(row.transaction_id_or_settlement_id);
                      const explanation = row.llm_explanation || 'No explanation available.';
                      const isLong = explanation.length > 80;
                      const displayExplanation = isExpanded ? explanation : (isLong ? `${explanation.slice(0, 80)}...` : explanation);
                      const resStatus = row.resolution_status || 'pending';

                      return (
                        <tr key={row.transaction_id_or_settlement_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-slate-400">{row.rank}</td>
                          <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{row.transaction_id_or_settlement_id}</td>
                          <td className="px-6 py-3.5">
                            <span 
                              className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                              style={{ 
                                backgroundColor: `${CATEGORY_COLORS[row.category]}15`, 
                                color: CATEGORY_COLORS[row.category] 
                              }}
                            >
                              {CATEGORY_LABELS[row.category] || row.category}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-slate-900">{(row.severity_score || 0).toFixed(4)}</td>
                          <td className="px-6 py-3.5 font-mono font-bold text-rose-600">{formatCurrency(row.rupee_amount)}</td>
                          <td className="px-6 py-3.5">
                            {resStatus === 'auto_resolved' ? (
                              <span 
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                title={row.resolution_reasoning || 'Autonomously resolved by agent'}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Auto-Resolved
                              </span>
                            ) : resStatus === 'escalated' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                Escalated
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                Pending Review
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-xs text-slate-600 leading-relaxed font-normal">
                            {displayExplanation}
                            {isLong && (
                              <button
                                onClick={() => toggleRowExpand(row.transaction_id_or_settlement_id)}
                                className="text-indigo-600 hover:text-indigo-700 font-bold ml-1.5 focus:outline-none cursor-pointer"
                              >
                                {isExpanded ? 'Less' : 'More'}
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <StatusBadge action={row.recommended_action} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No exceptions matching the selected criteria.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-slate-50/70 px-6 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-900">{offset + 1}</span> to{' '}
                  <span className="font-bold text-slate-900">
                    {Math.min(offset + pageSize, sortedExceptions.length)}
                  </span>{' '}
                  of <span className="font-bold text-slate-900">{sortedExceptions.length}</span> exceptions
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>

                  <span className="text-xs font-bold text-slate-700 px-2">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: AGENT AUDIT LOG */}
      {activeTab === 'audit_log' && (
        <div className="space-y-6">
          {/* Safety Guardrail Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 shadow-xs flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">🛡️</span>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                Safety Circuit Breaker Active & Enforced
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Exceptions with <strong>severity_score &gt; 0.60</strong> are strictly prohibited from autonomous resolution, even when recommended for approval. The agent autonomous gate requires <strong>confidence &gt; 85.0%</strong> and leaves all high-stakes deviations for human oversight.
              </p>
            </div>
          </div>

          {/* Audit Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs border-l-4 border-l-emerald-500">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Autonomous Actions Logged
              </div>
              <div className="text-2xl font-outfit font-black text-emerald-700">
                {auditTotal.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Traceable closed-loop actions</div>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs border-l-4 border-l-indigo-500">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Confidence Threshold
              </div>
              <div className="text-2xl font-outfit font-black text-indigo-700">
                &gt; 85.0%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Clean probability required</div>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs border-l-4 border-l-rose-500">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Circuit Breaker Cutoff
              </div>
              <div className="text-2xl font-outfit font-black text-rose-700">
                &le; 0.60
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Max allowable severity for auto-resolve</div>
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-outfit font-bold text-sm text-slate-900">
                Autonomous Actions Audit Trail
              </h3>
              <button
                onClick={() => fetchAuditActions(auditPage)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                🔄 Refresh Log
              </button>
            </div>

            <div className="overflow-x-auto">
              {auditLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : auditActions.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5 text-left">Timestamp (UTC)</th>
                      <th className="px-6 py-3.5 text-left">Exception ID</th>
                      <th className="px-6 py-3.5 text-left">Category</th>
                      <th className="px-6 py-3.5 text-left">Amount</th>
                      <th className="px-6 py-3.5 text-left">Action</th>
                      <th className="px-6 py-3.5 text-left">Confidence</th>
                      <th className="px-6 py-3.5 text-left">Severity</th>
                      <th className="px-6 py-3.5 text-left w-[35%]">Autonomous Reasoning Trail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {auditActions.map((action, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {action.timestamp?.replace('T', ' ').slice(0, 19) || '—'}
                        </td>
                        <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                          {action.exception_id}
                        </td>
                        <td className="px-6 py-3.5">
                          <span 
                            className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                            style={{ 
                              backgroundColor: `${CATEGORY_COLORS[action.category] || '#6366F1'}15`, 
                              color: CATEGORY_COLORS[action.category] || '#6366F1'
                            }}
                          >
                            {CATEGORY_LABELS[action.category] || action.category}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                          {formatCurrency(action.rupee_amount)}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Auto-Resolved
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono font-bold text-emerald-700">
                          {(action.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-700 text-xs">
                              {action.severity_score.toFixed(4)}
                            </span>
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                              &le; 0.60
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-600 leading-relaxed font-normal">
                          {action.reasoning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No autonomous actions recorded yet.
                </div>
              )}
            </div>

            {auditTotal > auditPageSize && (
              <div className="bg-slate-50/70 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium">
                  Showing page {auditPage} of {Math.ceil(auditTotal / auditPageSize)}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchAuditActions(auditPage - 1)}
                    disabled={auditPage === 1}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchAuditActions(auditPage + 1)}
                    disabled={auditPage * auditPageSize >= auditTotal}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExceptionQueue;
