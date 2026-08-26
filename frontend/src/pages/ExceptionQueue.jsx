import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { getExceptions } from '../api/client';
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
  
  // Filters State
  const [selectedCategories, setSelectedCategories] = useState(Object.keys(CATEGORY_LABELS));
  const [minSeverity, setMinSeverity] = useState(0.0);
  const [selectedAction, setSelectedAction] = useState('all');

  // Sorting State
  const [sortField, setSortField] = useState('severity_score');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Expanded explanations state (set of transaction IDs)
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    const fetchExceptions = async () => {
      try {
        setLoading(true);
        setError(null);
        // Request page_size=2000 to pull the complete dataset locally
        const response = await getExceptions({ page: 1, page_size: 2000 });
        setExceptions(response.items || []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch exception queue from backend. Ensure database is running and seeded.');
      } finally {
        setLoading(false);
      }
    };
    fetchExceptions();
  }, []);

  // Toggle category helper
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

  // Toggle expand row explanation helper
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

  // Sorting helper
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Filter items
  const filteredExceptions = exceptions.filter(item => {
    const matchesCategory = selectedCategories.includes(item.category);
    const matchesSeverity = (item.severity_score || 0) >= minSeverity;
    const matchesAction = selectedAction === 'all' || item.recommended_action === selectedAction;
    return matchesCategory && matchesSeverity && matchesAction;
  });

  // Sort items
  const sortedExceptions = [...filteredExceptions].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    
    if (typeof valA === 'string') {
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    } else {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
  });

  // Paginated items
  const offset = (currentPage - 1) * pageSize;
  const paginatedExceptions = sortedExceptions.slice(offset, offset + pageSize);
  const totalPages = Math.ceil(sortedExceptions.length / pageSize);

  // Compute total amount at risk post-filter
  const totalRupeeRisk = filteredExceptions.reduce((sum, item) => sum + (item.rupee_amount || 0), 0);

  // Chart Data 1: Category Pie/Donut Chart
  const categoryCounts = filteredExceptions.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoryCounts).map(catKey => ({
    name: CATEGORY_LABELS[catKey] || catKey,
    value: categoryCounts[catKey],
    color: CATEGORY_COLORS[catKey] || '#64748B'
  }));

  // Chart Data 2: Recommended Action Bar Chart
  const actionCounts = filteredExceptions.reduce((acc, item) => {
    acc[item.recommended_action] = (acc[item.recommended_action] || 0) + 1;
    return acc;
  }, {});

  const actionChartData = [
    { name: 'Auto Approve', count: actionCounts.auto_approve || 0, fill: ACTION_COLORS.auto_approve },
    { name: 'Flag For Review', count: actionCounts.flag_for_review || 0, fill: ACTION_COLORS.flag_for_review },
    { name: 'Escalate', count: actionCounts.escalate || 0, fill: ACTION_COLORS.escalate }
  ];

  // Helper to format currency in INR
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-6 py-4 rounded-xl">
          <h3 className="font-bold text-lg mb-1">⚠️ Error Loading Exceptions</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="gradient-header border border-navy-700 text-white rounded-xl p-6 sm:p-8 mb-8 shadow-md">
        <div className="text-indigo-400 font-extrabold text-xs tracking-wider uppercase mb-1">
          Audit & Action Center
        </div>
        <h1 className="font-outfit font-black text-3xl sm:text-4xl text-white tracking-tight">
          Unified Exception Queue
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Ranked, categorized anomalies and automated LLM audit reports.
        </p>
      </div>

      {/* Filter and Controls Panel */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Multiselect */}
        <div>
          <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-3">
            Filter by Exception Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2">
            {Object.keys(CATEGORY_LABELS).map((catKey) => (
              <label key={catKey} className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(catKey)}
                  onChange={() => handleCategoryToggle(catKey)}
                  className="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-gray-700 font-medium text-xs">{CATEGORY_LABELS[catKey]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Severity Slider */}
        <div className="flex flex-col justify-between">
          <div>
            <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-2">
              Minimum Severity Score: <span className="text-indigo-600 text-sm font-extrabold ml-1">{minSeverity.toFixed(2)}</span>
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
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1.5 uppercase">
              <span>0.0 (Low Urgency)</span>
              <span>1.0 (Critical Risk)</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                setSelectedCategories(Object.keys(CATEGORY_LABELS));
                setMinSeverity(0.0);
                setSelectedAction('all');
                setCurrentPage(1);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-500 font-bold flex items-center gap-1.5"
            >
              🧹 Reset All Filters
            </button>
          </div>
        </div>

        {/* Recommended Action Radio Filter */}
        <div>
          <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-3">
            Filter by Action
          </label>
          <div className="space-y-2">
            {[
              { id: 'all', label: 'All Actions' },
              { id: 'auto_approve', label: '✅ Auto Approve' },
              { id: 'flag_for_review', label: '⚠️ Flag For Review' },
              { id: 'escalate', label: '🚨 Escalate' }
            ].map((opt) => (
              <label key={opt.id} className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
                <input
                  type="radio"
                  name="actionFilter"
                  checked={selectedAction === opt.id}
                  onChange={() => {
                    setSelectedAction(opt.id);
                    setCurrentPage(1);
                  }}
                  className="text-indigo-600 border-gray-300 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-gray-700 font-medium text-xs">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm border-l-4 border-l-amber-500 flex justify-between items-center">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filtered Exceptions Shown</div>
            <div className="text-xl font-outfit font-black text-navy-800 mt-1">{filteredExceptions.length.toLocaleString()} items</div>
          </div>
          <span className="text-2xl" role="img" aria-label="exceptions">⚠️</span>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm border-l-4 border-l-rose-500 flex justify-between items-center">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filtered Rupee Amount at Risk</div>
            <div className="text-xl font-outfit font-black text-rose-600 mt-1">{formatCurrency(totalRupeeRisk)}</div>
          </div>
          <span className="text-2xl" role="img" aria-label="rupees">💸</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Pie Chart */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col">
          <h4 className="font-outfit font-bold text-base text-navy-800 mb-4">
            Exception Categories Distribution
          </h4>
          <div className="h-[250px] flex items-center justify-center">
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
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm font-semibold">No data matching filters</div>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4 text-[10px] font-bold text-gray-500 uppercase">
            {categoryChartData.map(entry => (
              <div key={entry.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar Chart */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <h4 className="font-outfit font-bold text-base text-navy-800 mb-4">
            Exceptions by Recommended Action
          </h4>
          <div className="h-[250px]">
            {filteredExceptions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" tickLine={false} fontSize={12} tickMargin={8} />
                  <YAxis stroke="#64748B" tickLine={false} axisLine={false} fontSize={12} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={50}>
                    {actionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm font-semibold">No data matching filters</div>
            )}
          </div>
          <div className="h-4" />
        </div>
      </div>

      {/* Exceptions Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          {sortedExceptions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-navy-700 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-3.5 text-left">Rank</th>
                  <th className="px-6 py-3.5 text-left">Transaction/Settlement ID</th>
                  <th className="px-6 py-3.5 text-left">Category</th>
                  <th 
                    className="px-6 py-3.5 text-left cursor-pointer hover:bg-gray-150 transition-colors select-none"
                    onClick={() => handleSort('severity_score')}
                  >
                    Severity Score {sortField === 'severity_score' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </th>
                  <th 
                    className="px-6 py-3.5 text-left cursor-pointer hover:bg-gray-150 transition-colors select-none"
                    onClick={() => handleSort('rupee_amount')}
                  >
                    Rupee Amount {sortField === 'rupee_amount' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </th>
                  <th className="px-6 py-3.5 text-left w-[35%]">LLM Explanation</th>
                  <th className="px-6 py-3.5 text-left">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {paginatedExceptions.map((row) => {
                  const isExpanded = expandedRows.has(row.transaction_id_or_settlement_id);
                  const explanation = row.llm_explanation || 'No explanation available.';
                  const isLong = explanation.length > 90;
                  const displayExplanation = isExpanded ? explanation : (isLong ? `${explanation.slice(0, 90)}...` : explanation);

                  return (
                    <tr key={row.transaction_id_or_settlement_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-500">{row.rank}</td>
                      <td className="px-6 py-4 font-mono font-bold text-xs text-navy-800">{row.transaction_id_or_settlement_id}</td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 font-bold text-navy-800">{(row.severity_score || 0).toFixed(4)}</td>
                      <td className="px-6 py-4 font-mono font-bold text-rose-600">{formatCurrency(row.rupee_amount)}</td>
                      <td className="px-6 py-4 text-xs text-gray-600 leading-relaxed font-medium">
                        {displayExplanation}
                        {isLong && (
                          <button
                            onClick={() => toggleRowExpand(row.transaction_id_or_settlement_id)}
                            className="text-indigo-600 hover:text-indigo-500 font-bold ml-1.5 focus:outline-none whitespace-nowrap"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge action={row.recommended_action} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-400 font-semibold text-sm">
              🚫 No exceptions match your active filters.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {sortedExceptions.length > 0 && (
          <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-navy-800">{offset + 1}</span> to{' '}
              <span className="font-bold text-navy-800">
                {Math.min(offset + pageSize, sortedExceptions.length)}
              </span>{' '}
              of <span className="font-bold text-navy-800">{sortedExceptions.length}</span> exceptions
            </div>
            
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                ⏮️ First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                ◀️ Previous
              </button>
              <span className="text-xs text-gray-600 font-bold px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                Next ▶️
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                Last ⏭️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExceptionQueue;
