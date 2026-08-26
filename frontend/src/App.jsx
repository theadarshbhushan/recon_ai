import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import ModelBenchmarks from './pages/ModelBenchmarks';
import ExceptionQueue from './pages/ExceptionQueue';
import BatchExplorer from './pages/BatchExplorer';
import HardModeDiagnostics from './pages/HardModeDiagnostics';
import LiveDemo from './pages/LiveDemo';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/benchmarks" element={<ModelBenchmarks />} />
            <Route path="/exceptions" element={<ExceptionQueue />} />
            <Route path="/explorer" element={<BatchExplorer />} />
            <Route path="/diagnostics" element={<HardModeDiagnostics />} />
            <Route path="/live" element={<LiveDemo />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} Recon AI. All rights reserved. Razorpay Buildathon 2026.
        </footer>
      </div>
    </Router>
  );
}

export default App;
