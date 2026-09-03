import React, { useState, useEffect } from 'react';
import { Search, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSummary } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const BatchExplorer = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [batchDetail, setBatchDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSummary();
      const mockBatches = [
        { id: 'BAT_30001', merchant: 'merch_01', date: '2026-08-02', items: 3, total: 18450.00, status: 'Matched' },
        { id: 'BAT_30002', merchant: 'merch_02', date: '2026-08-03', items: 4, total: 24300.50, status: 'Matched' },
        { id: 'BAT_30003', merchant: 'merch_01', date: '2026-08-05', items: 2, total: 12100.00, status: 'Residual Discrepancy' },
        { id: 'BAT_30004', merchant: 'merch_03', date: '2026-08-06', items: 5, total: 45200.00, status: 'Matched' },
        { id: 'BAT_30005', merchant: 'merch_02', date: '2026-08-08', items: 3, total: 29800.75, status: 'Collision Unresolved' }
      ];
      setBatches(mockBatches);
      if (mockBatches.length > 0) {
        setSelectedBatchId(mockBatches[0].id);
        fetchBatchDetail(mockBatches[0].id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load batch explorer list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchDetail = async (batchId) => {
    try {
      setDetailLoading(true);
      setBatchDetail({
        batch_id: batchId,
        settlement_ref: `SET_BANK_${batchId.replace('BAT_', '')}`,
        merchant_id: 'merch_01',
        settlement_date: '2026-08-02',
        expected_total: 18450.00,
        actual_settled: 18450.00,
        discrepancy: 0.00,
        algorithm_used: 'Meet-in-the-Middle Subset-Sum',
        execution_time_ms: 4.12,
        decomposition_status: 'Fully Decomposed',
        constituents: [
          { txn_id: 'TXN_10012', amount: 6200.00, fee: 124.00, net: 6076.00, match_status: 'Auto-Matched' },
          { txn_id: 'TXN_10015', amount: 8500.00, fee: 170.00, net: 8330.00, match_status: 'Auto-Matched' },
          { txn_id: 'TXN_10018', amount: 4124.00, fee: 80.00, net: 4044.00, match_status: 'Auto-Matched' }
        ]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectBatch = (id) => {
    setSelectedBatchId(id);
    fetchBatchDetail(id);
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.merchant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="wise-eyebrow text-indigo-600 mb-2">
          Batch Level Auditing
        </div>
        <h1 className="wise-page-title text-3xl sm:text-5xl text-slate-950">
          Batch Explorer
        </h1>
        <p className="wise-body text-slate-500 text-sm sm:text-base mt-1">
          Inspect multi-transaction bank settlements decomposed by our subset-sum combinatorial solver.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Batch Selector */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="wise-card-title text-sm">Settlement Batches</h3>
            <span className="text-xs text-slate-400 font-bold">{filteredBatches.length} available</span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search batch or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredBatches.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBatch(b.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedBatchId === b.id
                    ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs text-slate-900">{b.id}</span>
                  <span className={`text-[10px] font-black rounded-full px-2.5 py-0.5 border ${
                    b.status === 'Matched' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{b.merchant}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(b.total)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Batch Decomposition Details */}
        <div className="lg:col-span-2 space-y-6">
          {batchDetail && (
            <>
              {/* Batch Metadata Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <span className="wise-eyebrow text-indigo-600">Settlement Verification</span>
                    <h2 className="wise-section-title text-2xl text-slate-950 mt-1">
                      {batchDetail.batch_id} Details
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-black">
                    {batchDetail.decomposition_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Settlement Ref</div>
                    <div className="text-xs font-mono font-bold text-slate-900 mt-1 truncate">{batchDetail.settlement_ref}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Expected Total</div>
                    <div className="text-xs font-black text-slate-900 mt-1">{formatCurrency(batchDetail.expected_total)}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Solver Algorithm</div>
                    <div className="text-xs font-bold text-indigo-600 mt-1 truncate">{batchDetail.algorithm_used}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Execution Time</div>
                    <div className="text-xs font-bold text-slate-700 mt-1">{batchDetail.execution_time_ms} ms</div>
                  </div>
                </div>
              </div>

              {/* Constituent Transactions Table */}
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70">
                  <h3 className="wise-card-title text-sm">
                    Reconstructed Constituent Transactions ({batchDetail.constituents?.length || 0} items)
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4 text-right">Gross Amount</th>
                        <th className="py-3 px-4 text-right">MDR Fee</th>
                        <th className="py-3 px-4 text-right">Net Settled</th>
                        <th className="py-3 px-4">Match Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {batchDetail.constituents?.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.txn_id}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">{formatCurrency(c.amount)}</td>
                          <td className="py-3 px-4 text-right text-slate-500 font-mono">{formatCurrency(c.fee)}</td>
                          <td className="py-3 px-4 text-right font-black text-indigo-700 font-mono">{formatCurrency(c.net)}</td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-[11px] font-black">
                              {c.match_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchExplorer;
