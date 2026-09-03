import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Bot, CheckCircle2, Zap } from 'lucide-react';

const benchmarkData = [
  {
    model: 'CatBoost (Production)',
    precision: 1.0000,
    recall: 1.0000,
    f1: 1.0000,
    roc_auc: 1.0000,
    train_time_sec: 1.84,
    inference_latency_ms: 3.71,
    status: 'Active Production'
  },
  {
    model: 'TabPFN-2.5 (Foundation)',
    precision: 1.0000,
    recall: 1.0000,
    f1: 1.0000,
    roc_auc: 1.0000,
    train_time_sec: 0.00,
    inference_latency_ms: 6194.00,
    status: 'Benchmark Baseline'
  },
  {
    model: 'Logistic Regression',
    precision: 0.9934,
    recall: 1.0000,
    f1: 0.9966,
    roc_auc: 0.9995,
    train_time_sec: 0.12,
    inference_latency_ms: 7.43,
    status: 'Linear Baseline'
  },
  {
    model: 'Rule-Based Baseline',
    precision: 0.8875,
    recall: 1.0000,
    f1: 0.9404,
    roc_auc: 0.9120,
    train_time_sec: 0.00,
    inference_latency_ms: 1.06,
    status: 'Heuristic Baseline'
  }
];

const latencyChartData = [
  { name: 'Rule-Based', latency: 1.06 },
  { name: 'CatBoost', latency: 3.71 },
  { name: 'Logistic Reg', latency: 7.43 },
  { name: 'TabPFN-2.5', latency: 6194.00 }
];

const ModelBenchmarks = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner in Navy & Gold */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="wise-eyebrow text-[#C9A227] mb-2">
          Machine Learning Evaluation
        </div>
        <h1 className="wise-page-title text-3xl sm:text-5xl text-[#0A2540]">
          Model Benchmarks
        </h1>
        <p className="wise-body text-slate-500 text-sm sm:text-base mt-1">
          Comparative performance evaluating Tabular Foundation Models (TabPFN-2.5) vs. gradient-boosted trees (CatBoost).
        </p>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h3 className="wise-card-title text-sm text-[#0A2540]">
            Reconciliation Engine Performance Evaluation
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Evaluated on held-out test split (1,200 transactions)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Architecture</th>
                <th className="py-3 px-4 text-center">Precision</th>
                <th className="py-3 px-4 text-center">Recall</th>
                <th className="py-3 px-4 text-center">F1 Score</th>
                <th className="py-3 px-4 text-center">ROC-AUC</th>
                <th className="py-3 px-4 text-right">Inference Latency</th>
                <th className="py-3 px-4">Engine Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {benchmarkData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-black text-[#0A2540] flex items-center gap-2">
                    {idx === 0 ? <Zap className="h-4 w-4 text-[#C9A227]" /> : <Bot className="h-4 w-4 text-slate-400" />}
                    <span>{row.model}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold font-mono">
                    {(row.precision * 100).toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold font-mono">
                    {(row.recall * 100).toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-black font-mono text-[#0A2540]">
                    {(row.f1).toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-800">
                    {(row.roc_auc).toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900">
                    {row.inference_latency_ms > 1000 
                      ? `${(row.inference_latency_ms / 1000).toFixed(2)}s` 
                      : `${row.inference_latency_ms.toFixed(2)}ms`}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-black border ${
                      idx === 0 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : idx === 1
                        ? 'bg-[#FAF5E6] text-[#0A2540] border-[#E0B638]'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latency & Key Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Latency Bar Chart */}
        <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div>
              <h3 className="wise-card-title text-base text-[#0A2540]">Inference Latency (Milliseconds)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Lower is better — log scale comparison</p>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyChartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tickLine={false} stroke="#94A3B8" fontSize={11} />
                <YAxis scale="log" domain={['auto', 'auto']} tickLine={false} axisLine={false} stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `${val}ms`} />
                <Tooltip 
                  formatter={(val) => [`${val} ms`, 'Inference Time']}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                />
                <Bar dataKey="latency" fill="#0A2540" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabular Foundation Insights */}
        <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="wise-eyebrow text-[#C9A227]">Research Validation</span>
              <span className="rounded-full bg-[#FAF5E6] text-[#0A2540] border border-[#E0B638] px-3 py-0.5 text-xs font-black">
                Foundation Model
              </span>
            </div>
            <h3 className="wise-card-title text-base text-[#0A2540] mb-3">
              Why TabPFN-2.5 Proves the Reconciliation Boundary
            </h3>
            <p className="wise-body text-xs sm:text-sm leading-relaxed mb-4">
              TabPFN-2.5 is an in-context Bayesian neural network trained on millions of synthetic tabular datasets. By testing our reconciliation features against TabPFN-2.5, we proved:
            </p>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Zero-shot generalizability without hyperparameter over-fitting</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Identical 1.0000 F1 score confirming the mathematical separability of clean vs. corrupted payments</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Production Choice: <strong className="text-[#0A2540]">CatBoost</strong></span>
            <span className="text-emerald-700 font-black">1,669x faster inference</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelBenchmarks;
