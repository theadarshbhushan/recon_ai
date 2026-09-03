import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getBatches, getBatch } from '../api/client';

const METHOD_BADGES = {
  exact_combinatorial: { label: 'Exact Combinatorial', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  meet_in_the_middle: { label: 'Meet-In-The-Middle', style: 'bg-teal-50 text-teal-700 border-teal-200' },
  total_sum_match: { label: 'Total Sum Match', style: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  greedy_fallback: { label: 'Greedy Fallback Match', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  failed: { label: 'Matching Failed', style: 'bg-rose-50 text-rose-700 border-rose-200' },
  'Ground Truth Mapping': { label: 'Ground Truth Mapping', style: 'bg-blue-50 text-blue-700 border-blue-200' }
};

const BatchExplorer = () => {
  const location = useLocation();
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [batchDetail, setBatchDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load list of batches on mount
  useEffect(() => {
    const fetchBatchList = async () => {
      try {
        setLoadingList(true);
        const data = await getBatches();
        setBatches(data || []);
        if (data && data.length > 0) {
          const initialSearch = location.state?.searchQuery;
          if (initialSearch) {
            const matched = data.find(b => 
              b.batch_id.toLowerCase().includes(initialSearch.toLowerCase()) || 
              (b.utr_number && b.utr_number.toLowerCase().includes(initialSearch.toLowerCase())) ||
              (b.merchant_id && b.merchant_id.toLowerCase().includes(initialSearch.toLowerCase())) ||
              (b.settlement_date && b.settlement_date.toLowerCase().includes(initialSearch.toLowerCase()))
            );
            if (matched) {
              setSelectedBatchId(matched.batch_id);
            } else {
              setSelectedBatchId(data[0].batch_id);
            }
          } else {
            setSelectedBatchId(data[0].batch_id);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch the list of settlement batches.');
      } finally {
        setLoadingList(false);
      }
    };
    fetchBatchList();
  }, [location]);

  // Read search query from location state if navigate-through
  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
      setIsDropdownOpen(true);
    }
  }, [location]);

  // Fetch details when selectedBatchId changes
  useEffect(() => {
    if (!selectedBatchId) return;
    const fetchBatchDetails = async () => {
      try {
        setLoadingDetail(true);
        const detail = await getBatch(selectedBatchId);
        setBatchDetail(detail);
      } catch (err) {
        console.error(err);
        // Do not block the whole page if a single detail fetch fails
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchBatchDetails();
  }, [selectedBatchId]);

  // Filter batches based on search
  const filteredBatches = batches.filter(b => 
    b.batch_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (b.utr_number && b.utr_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (b.merchant_id && b.merchant_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedBatchLabel = batches.find(b => b.batch_id === selectedBatchId)
    ? (() => {
        const b = batches.find(b => b.batch_id === selectedBatchId);
        return `${b.batch_id} — ${b.merchant_id} — ${b.settlement_date}`;
      })()
    : 'Select a settlement batch...';

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val || 0);
  };

  if (loadingList) {
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
          <h3 className="font-bold text-lg mb-1">⚠️ Error Retrieving Batches</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const bankSummary = batchDetail?.bank_summary || {};
  const hardDiag = batchDetail?.hard_mode_diagnostics || {};
  const components = batchDetail?.components || [];
  const methodUsed = hardDiag.method_used || 'Ground Truth Mapping';
  const methodInfo = METHOD_BADGES[methodUsed] || { label: methodUsed, style: 'bg-slate-50 text-slate-700 border-slate-200' };

  const isCollisionDate = bankSummary.settlement_date === '2026-08-19' || hardDiag.date === '2026-08-19';
  const isFailedBatch = methodUsed === 'failed' || hardDiag.matched === false;

  // Prepare chart data for allocation splits
  const splitChartData = components.map(c => ({
    name: c.transaction_id,
    'Allocated Amount (₹)': c.allocated_amount,
    'Expected Amount (₹)': c.expected_settled_amount
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="text-indigo-600 font-extrabold text-[11px] tracking-wider uppercase mb-1">
          Settlement Analysis
        </div>
        <h1 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Batch Decomposition Explorer
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Drill down into compound bank transfers to extract individual transaction shares and matching logs.
        </p>
      </div>

      {/* Select Batch Searchable Dropdown */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs mb-8 relative z-20">
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
          Search & Select Settlement Batch
        </label>
        
        {/* Custom Searchable Select Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-left text-sm font-semibold text-navy-800 shadow-sm hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex justify-between items-center transition-colors"
          >
            <span>{selectedBatchLabel}</span>
            <span className="text-gray-400 text-xs">▼</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-[300px] overflow-hidden flex flex-col">
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Type to search UTR, batch, or merchant ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>
              <div className="overflow-y-auto flex-1">
                {filteredBatches.length > 0 ? (
                  filteredBatches.map((b) => (
                    <button
                      key={b.batch_id}
                      onClick={() => {
                        setSelectedBatchId(b.batch_id);
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors border-b border-gray-50 flex justify-between ${
                        b.batch_id === selectedBatchId ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="font-mono">{b.batch_id}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{b.merchant_id} • {b.settlement_date}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400 font-bold">No batches match search</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {loadingDetail ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : batchDetail ? (
        <div className="space-y-8 relative z-10">
          
          {/* Documented Collision Panel Alert */}
          {isCollisionDate && (
            <div className="bg-amber-900 border border-amber-700 rounded-xl p-5 shadow-sm text-white flex items-start gap-4 animate-pulse">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-outfit font-bold text-sm text-amber-400 uppercase tracking-wider mb-1">
                  Documented Collision Alert: August 19, 2026
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  On this specific date, high transaction density resulted in a subset-sum collision. Standard mathematical solvers produced multiple valid combinations summing to the exact target batch amount, causing matching ambiguities. Hard Mode resolves this by cross-referencing temporal delay features and ML confidence ranks.
                </p>
              </div>
            </div>
          )}

          {/* Batch Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Settlement Amount</div>
              <div className="text-xl font-outfit font-black text-navy-800 mt-1">{formatCurrency(bankSummary.amount)}</div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Merchant ID</div>
              <div className="text-xl font-outfit font-black text-navy-800 mt-1">{bankSummary.merchant_id}</div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Settlement Date</div>
              <div className="text-xl font-outfit font-black text-navy-800 mt-1">{bankSummary.settlement_date}</div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Decomposition Method</div>
              <div className="mt-1">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${methodInfo.style}`}>
                  {methodInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Failed Batch Display State */}
          {isFailedBatch ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center max-w-2xl mx-auto shadow-sm">
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="font-outfit font-black text-lg text-rose-800 mb-2">
                This batch could not be resolved
              </h3>
              <p className="text-sm text-rose-700 leading-relaxed mb-6">
                The combinatorial search failed to decompose this transfer into matching gateway transactions.
                No exact subsets met the reconciliation threshold.
              </p>
              
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
                <div className="bg-white p-3.5 border border-rose-200 rounded-lg">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Candidate Pool Size</div>
                  <div className="text-base font-bold text-navy-800 mt-0.5">{hardDiag.candidate_pool_size || 'N/A'} items</div>
                </div>
                <div className="bg-white p-3.5 border border-rose-200 rounded-lg">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Target Amount</div>
                  <div className="text-base font-bold text-navy-800 mt-0.5">{formatCurrency(bankSummary.amount)}</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Charts & Split Split visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Components Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden lg:col-span-2">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-outfit font-bold text-sm text-navy-800 uppercase tracking-wider">
                      Matched Component Transactions
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50 text-navy-700 font-bold uppercase">
                        <tr>
                          <th className="px-6 py-3 text-left">Transaction ID</th>
                          <th className="px-6 py-3 text-right">Individual Amount</th>
                          <th className="px-6 py-3 text-right">Expected Settled</th>
                          <th className="px-6 py-3 text-right">Allocated Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                        {components.map((c) => (
                          <tr key={c.transaction_id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-navy-800">{c.transaction_id}</td>
                            <td className="px-6 py-4 text-right">{formatCurrency(c.amount)}</td>
                            <td className="px-6 py-4 text-right text-indigo-600 font-bold">{formatCurrency(c.expected_settled_amount)}</td>
                            <td className="px-6 py-4 text-right text-gray-500 font-bold">{(c.allocated_share * 100).toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recharts Splits bar chart */}
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-outfit font-bold text-sm text-navy-800 uppercase tracking-wider mb-4">
                      Batch Share Allocation Split
                    </h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={splitChartData} layout="vertical" margin={{ left: -10, right: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                          <XAxis type="number" stroke="#64748B" tickLine={false} fontSize={10} />
                          <YAxis dataKey="name" type="category" stroke="#64748B" tickLine={false} fontSize={9} width={75} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                            formatter={(value) => [formatCurrency(value), 'Amount']}
                          />
                          <Bar dataKey="Expected Amount (₹)" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 font-bold text-sm">
          Select a batch from the explorer dropdown to analyze details.
        </div>
      )}
    </div>
  );
};

export default BatchExplorer;
