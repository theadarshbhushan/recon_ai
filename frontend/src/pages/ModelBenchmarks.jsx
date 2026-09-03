import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBenchmark } from '../api/client';

const ModelBenchmarks = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [benchmarks, setBenchmarks] = useState([]);

  useEffect(() => {
    const fetchBenchmarks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBenchmark();
        setBenchmarks(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load classifier benchmarks from the datastore. Please verify models.py was executed.');
      } finally {
        setLoading(false);
      }
    };
    fetchBenchmarks();
  }, []);

  // Filter benchmarks that succeeded for chart visualization
  const validBenchmarks = benchmarks.filter(b => b.Status === 'Success' && b['F1-Score'] !== null);

  // Re-map data for execution times comparison
  const timeChartData = validBenchmarks.map(b => ({
    name: b.Model,
    // Enforce small positive value to avoid log scale zero/negative crash
    'Train Time (s)': Math.max(0.00001, b['Train Time (s)'] || 0),
    'Inference Time (s)': Math.max(0.00001, b['Inference Time (s)'] || 0),
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-6 py-4 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-1">⚠️ Error Retrieving Benchmarks</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="text-indigo-600 font-extrabold text-[11px] tracking-wider uppercase mb-1">
          ML Engine Evaluation
        </div>
        <h1 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
          ML Confidence Models Benchmarking
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Compare rule-based thresholds with learned Logistic Regression, CatBoost, and TabPFN classifiers.
        </p>
      </div>

      {/* Metrics Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-outfit font-bold text-base text-slate-900">
            Benchmark Metrics Comparison
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Model</th>
                <th className="px-6 py-3.5 text-left">Precision</th>
                <th className="px-6 py-3.5 text-left">Recall</th>
                <th className="px-6 py-3.5 text-left">F1-Score</th>
                <th className="px-6 py-3.5 text-left">ROC-AUC</th>
                <th className="px-6 py-3.5 text-left">Train Time</th>
                <th className="px-6 py-3.5 text-left">Inference Time</th>
                <th className="px-6 py-3.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {benchmarks.map((row) => (
                <tr key={row.Model} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-navy-800">{row.Model}</td>
                  <td className="px-6 py-4">{row.Precision !== null ? row.Precision.toFixed(4) : 'N/A'}</td>
                  <td className="px-6 py-4">{row.Recall !== null ? row.Recall.toFixed(4) : 'N/A'}</td>
                  <td className="px-6 py-4 font-medium text-indigo-600">
                    {row['F1-Score'] !== null ? row['F1-Score'].toFixed(4) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">{row['ROC-AUC'] !== null ? row['ROC-AUC'].toFixed(4) : 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {row['Train Time (s)'] !== null ? `${row['Train Time (s)'].toFixed(4)}s` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {row['Inference Time (s)'] !== null ? `${row['Inference Time (s)'].toFixed(5)}s` : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      row.Status === 'Success' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {row.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* F1-Score Chart */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="font-outfit font-bold text-base text-navy-800 mb-4">
            F1-Score Comparison
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={validBenchmarks}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="Model" stroke="#64748B" tickLine={false} fontSize={12} tickMargin={8} />
                <YAxis domain={[0.4, 1.05]} stroke="#64748B" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} 
                  formatter={(value) => [value.toFixed(4), 'F1-Score']}
                />
                <Bar dataKey="F1-Score" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Comparison (Log Scale) */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="font-outfit font-bold text-base text-navy-800 mb-4">
            Train & Inference Latency Comparison (Log Scale Y-Axis)
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" tickLine={false} fontSize={12} tickMargin={8} />
                <YAxis 
                  scale="log" 
                  domain={[0.0001, 1000]} 
                  stroke="#64748B" 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={12}
                  tickFormatter={(tick) => `${tick}s`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  formatter={(value) => [`${value.toFixed(5)}s`, 'Latency']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Bar dataKey="Train Time (s)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Inference Time (s)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Industrial Selection Callout */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-5 shadow-sm text-white flex items-start gap-4">
        <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 p-2.5 rounded-lg flex items-center justify-center font-bold text-xl leading-none">
          ℹ️
        </div>
        <div>
          <h4 className="font-outfit font-bold text-sm text-amber-500 uppercase tracking-wider mb-1">
            Industrial Deployment Note
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            TabPFN-2.5 matches CatBoost's accuracy but trains significantly slower — CatBoost is the production choice; TabPFN is included as a benchmarked alternative demonstrating rigorous model selection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelBenchmarks;
