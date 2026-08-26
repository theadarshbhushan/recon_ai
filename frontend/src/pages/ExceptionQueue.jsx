import React from 'react';

const ExceptionQueue = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-outfit font-bold text-navy-800 mb-4">⚠️ Exception Queue</h2>
        <p className="text-gray-600">This page will showcase our ranked, LLM-explained reconciliation exceptions database, pulling directly from MongoDB collections.</p>
      </div>
    </div>
  );
};

export default ExceptionQueue;
