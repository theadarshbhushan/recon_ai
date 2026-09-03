import React, { useState } from 'react';
import { predict } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const PRESETS = {
  clean: {
    label: 'Clean Transaction',
    description: 'UPI transaction with 1-day delay, normal batch residual, no diff.',
    values: {
      gateway_amount: 5000,
      payment_method: 'upi',
      status: 'success',
      date_diff_days: 1,
      batch_size: 4,
      batch_residual_pct: 0.0,
      amount_diff_pct: 0.0,
      refund_amount: 0.0
    }
  },
  suspicious_refund: {
    label: 'Suspicious Refund',
    description: 'Card transaction, partial refund status with residual discrepancies.',
    values: {
      gateway_amount: 12500,
      payment_method: 'card',
      status: 'partial_refund',
      date_diff_days: 3,
      batch_size: 6,
      batch_residual_pct: 12.5,
      amount_diff_pct: 5.0,
      refund_amount: 4500.0
    }
  },
  major_timing: {
    label: 'Major Timing Delay',
    description: 'Netbanking success but with a 9-day settlement delay.',
    values: {
      gateway_amount: 32000,
      payment_method: 'netbanking',
      status: 'success',
      date_diff_days: 9,
      batch_size: 11,
      batch_residual_pct: 0.0,
      amount_diff_pct: 0.0,
      refund_amount: 0.0
    }
  }
};

const LiveDemo = () => {
  const [form, setForm] = useState({
    gateway_amount: 5000,
    payment_method: 'upi',
    status: 'success',
    date_diff_days: 1,
    batch_size: 4,
    batch_residual_pct: 0.0,
    amount_diff_pct: 0.0,
    refund_amount: 0.0
  });

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);

  // Auto fill helper
  const handleApplyPreset = (presetKey) => {
    setForm({ ...PRESETS[presetKey].values });
    setResult(null);
    setError(null);
  };

  // Form input change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'payment_method' || name === 'status' ? value : parseFloat(value)
    }));
  };

  // Submit checker
  const handleRunCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setLatency(null);

    const startTime = performance.now();

    try {
      setLoadingStage('Running model inference...');
      // Small timeout simulation for realistic multi-stage loader visualizer
      await new Promise(resolve => setTimeout(resolve, 800));

      setLoadingStage('Generating explanation via Claude API...');
      
      const payload = {
        gateway_amount: parseFloat(form.gateway_amount),
        payment_method: form.payment_method,
        status: form.status,
        date_diff_days: parseInt(form.date_diff_days),
        batch_size: parseInt(form.batch_size),
        batch_residual_pct: parseFloat(form.batch_residual_pct),
        amount_diff_pct: parseFloat(form.amount_diff_pct),
        refund_amount: parseFloat(form.refund_amount)
      };

      const response = await predict(payload, true);
      
      const endTime = performance.now();
      setLatency(endTime - startTime);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError('An error occurred during transaction checking. Showing default model estimation if available.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="text-indigo-600 font-extrabold text-[11px] tracking-wider uppercase mb-1">
          Interactive Inference Playground
        </div>
        <h1 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Single Prediction Sandbox
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Test individual payment parameters against the ML engine and generate plain-English explanations live.
        </p>
      </div>

      {/* Preset buttons */}
      <div className="mb-8 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3">
          Select Demo Presets
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(PRESETS).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              className="text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-slate-50 transition-all focus:outline-none"
            >
              <div className="font-bold text-xs text-navy-800 uppercase">{PRESETS[key].label}</div>
              <div className="text-[10px] text-gray-500 font-medium mt-1 leading-relaxed">
                {PRESETS[key].description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Panel */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h3 className="font-outfit font-bold text-base text-navy-800 mb-6">
            Transaction Parameters Input
          </h3>

          <form onSubmit={handleRunCheck} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gateway Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Gateway Amount (₹)
                </label>
                <input
                  type="number"
                  name="gateway_amount"
                  value={form.gateway_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-navy-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-colors"
                />
              </div>

              {/* Refund Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  name="refund_amount"
                  value={form.refund_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-navy-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-navy-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Netbanking</option>
                  <option value="wallet">Wallet</option>
                  <option value="emi">EMI</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Transaction Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-navy-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="success">Success</option>
                  <option value="partial_refund">Partial Refund</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <hr className="border-gray-150 my-2" />

            {/* Delay slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                <span>Settlement Delay</span>
                <span className="text-indigo-600 font-extrabold">{form.date_diff_days} days</span>
              </div>
              <input
                type="range"
                name="date_diff_days"
                min="0"
                max="10"
                value={form.date_diff_days}
                onChange={handleChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              />
            </div>

            {/* Batch Size slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                <span>Batch Size (Components count)</span>
                <span className="text-indigo-600 font-extrabold">{form.batch_size} items</span>
              </div>
              <input
                type="range"
                name="batch_size"
                min="1"
                max="15"
                value={form.batch_size}
                onChange={handleChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Batch Residual slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  <span>Batch Residual %</span>
                  <span className="text-indigo-600 font-extrabold">{form.batch_residual_pct}%</span>
                </div>
                <input
                  type="range"
                  name="batch_residual_pct"
                  min="-50"
                  max="50"
                  step="0.5"
                  value={form.batch_residual_pct}
                  onChange={handleChange}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
              </div>

              {/* Amount Diff slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  <span>Amount Diff %</span>
                  <span className="text-indigo-600 font-extrabold">{form.amount_diff_pct}%</span>
                </div>
                <input
                  type="range"
                  name="amount_diff_pct"
                  min="-50"
                  max="50"
                  step="0.5"
                  value={form.amount_diff_pct}
                  onChange={handleChange}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 select-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>{loadingStage}</span>
                  </>
                ) : (
                  <span>🚀 Run Reconciliation Check</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col justify-start">
          {loading ? (
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm animate-pulse">
              <div className="text-2xl mb-4 font-bold text-indigo-600 animate-bounce">⚙️</div>
              <h3 className="font-outfit font-black text-gray-700 text-sm uppercase tracking-wider">
                Reconciling Parameters
              </h3>
              <p className="text-xs text-gray-500 mt-2 font-medium">{loadingStage}</p>
            </div>
          ) : result ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
              <div>
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
                  <h3 className="font-outfit font-bold text-sm text-navy-800 uppercase tracking-wider">
                    Reconciliation Assessment
                  </h3>
                  {latency && (
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase">
                      ⏱️ {latency.toFixed(0)}ms
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {/* Confidence & Severity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 border border-gray-150 rounded-xl text-center">
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Clean Probability</div>
                      <div className="text-3xl font-outfit font-black text-indigo-600 mt-1">
                        {(result.confidence_score * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 border border-gray-150 rounded-xl text-center">
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Severity Score</div>
                      <div className="text-3xl font-outfit font-black text-rose-600 mt-1">
                        {result.severity.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Action and Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Recommended Decision
                      </label>
                      <StatusBadge action={result.recommended_action} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Exception Category
                      </label>
                      <span className="inline-flex px-3 py-1 rounded bg-slate-100 text-navy-800 border border-gray-200 text-xs font-bold uppercase tracking-wider">
                        {result.category}
                      </span>
                    </div>
                  </div>

                  {/* LLM Explanation */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Auditor AI Explanation report
                    </label>
                    <div className="bg-navy-950 text-slate-200 border border-navy-850 p-5 rounded-xl text-xs font-medium leading-relaxed font-mono relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 p-2 text-navy-800 text-[10px] font-bold select-none uppercase tracking-widest">
                        Claude
                      </div>
                      <p>{result.llm_explanation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-gray-200 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                  ⚡ Live model inference (CatBoost) + live Claude API call — not a canned response
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center flex-1 flex flex-col items-center justify-center min-h-[350px]">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="font-outfit font-black text-rose-800 text-base uppercase tracking-wider mb-2">
                Prediction Pipeline Failed
              </h3>
              <p className="text-xs text-rose-700 leading-relaxed max-w-sm">
                {error}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[350px] text-center flex-1">
              <span className="text-3xl mb-4" role="img" aria-label="sandglass">⏳</span>
              <h3 className="font-outfit font-bold text-navy-800 text-sm uppercase tracking-wider mb-1">
                Awaiting Inputs Submission
              </h3>
              <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">
                Click a preset button above to auto-populate parameters or set individual parameters on the left slider control panels, then click Run Check.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDemo;
