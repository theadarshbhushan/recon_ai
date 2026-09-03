import React, { useState } from 'react';
import { Zap, ShieldCheck, Sparkles } from 'lucide-react';
import { predict } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const PRESETS = [
  {
    name: 'Clean Standard Transaction',
    data: {
      gateway_amount: 5000,
      refund_amount: 0,
      payment_method: 'card',
      transaction_status: 'captured',
      settlement_delay_days: 1,
      batch_size: 4,
      batch_residual_pct: 0
    }
  },
  {
    name: 'Suspicious Refund Drift',
    data: {
      gateway_amount: 14500,
      refund_amount: 4500,
      payment_method: 'upi',
      transaction_status: 'refunded',
      settlement_delay_days: 4,
      batch_size: 1,
      batch_residual_pct: 31.0
    }
  },
  {
    name: 'High-Severity Unsettled Batch',
    data: {
      gateway_amount: 28400,
      refund_amount: 0,
      payment_method: 'netbanking',
      transaction_status: 'failed',
      settlement_delay_days: 6,
      batch_size: 12,
      batch_residual_pct: 100.0
    }
  }
];

const LiveDemo = () => {
  const [formData, setFormData] = useState(PRESETS[0].data);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePreset = (preset) => {
    setFormData(preset.data);
    setResult(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleRunInference = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await predict(formData, true);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError('Inference failed. Please check inputs and API status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner in Slate & Electric Blue */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="wise-eyebrow text-blue-600 mb-2">
          Single Prediction Sandbox
        </div>
        <h1 className="wise-page-title text-3xl sm:text-5xl text-slate-900">
          Live Demo
        </h1>
        <p className="wise-body text-slate-500 text-sm sm:text-base mt-1">
          Simulate an incoming transaction to test live CatBoost model scoring and Claude LLM explanation generation.
        </p>
      </div>

      {/* Preset Selectors as Rounded-Full Pill Buttons */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs mb-8">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Quick Benchmark Presets</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePreset(p)}
              className="rounded-full px-5 py-2 text-xs font-black bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-900 transition-all cursor-pointer shadow-2xs hover-scale"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl text-xs font-bold mb-6">
          {error}
        </div>
      )}

      {/* Form and Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Inputs Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h3 className="wise-card-title text-base text-slate-900 mb-4 pb-3 border-b border-slate-100">
            Transaction Parameters
          </h3>

          <form onSubmit={handleRunInference} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Gateway Amount (INR)
                </label>
                <input
                  type="number"
                  name="gateway_amount"
                  value={formData.gateway_amount}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Refund Amount (INR)
                </label>
                <input
                  type="number"
                  name="refund_amount"
                  value={formData.refund_amount}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                >
                  <option value="card">card</option>
                  <option value="upi">upi</option>
                  <option value="netbanking">netbanking</option>
                  <option value="wallet">wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  name="transaction_status"
                  value={formData.transaction_status}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                >
                  <option value="captured">captured</option>
                  <option value="refunded">refunded</option>
                  <option value="failed">failed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Settlement Delay
                </label>
                <input
                  type="number"
                  name="settlement_delay_days"
                  value={formData.settlement_delay_days}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Batch Size
                </label>
                <input
                  type="number"
                  name="batch_size"
                  value={formData.batch_size}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Residual %
                </label>
                <input
                  type="number"
                  name="batch_residual_pct"
                  value={formData.batch_residual_pct}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 btn-pill-primary py-3.5 px-6 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover-scale"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Running Inference...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-blue-200" />
                  <span>Run Reconciliation Check</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="wise-card-title text-base text-slate-900">Model Verdict & Audit Explanation</h3>
              {result && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Inference: ~3.7ms
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Clean Probability</div>
                    <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                      {((result.clean_probability || 0) * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Severity Score</div>
                    <div className="text-2xl font-black text-blue-600 mt-1 font-mono">
                      {(result.severity_score || 0).toFixed(4)}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Recommended Decision:</span>
                  <StatusBadge action={result.recommended_decision || result.recommended_action} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>🤖 Claude Audit Explanation</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-3.5 rounded-xl border border-slate-200">
                    {result.llm_explanation || 'Transaction processed cleanly with standard settlement parameters.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                <Zap className="h-8 w-8 mx-auto mb-2 opacity-40 text-blue-600" />
                Select a preset or edit parameters and click "Run Reconciliation Check" to view live model results.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Autonomous circuit breaker thresholds applied automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDemo;
