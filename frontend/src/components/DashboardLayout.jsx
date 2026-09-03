import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* SaaS Left Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area shifted right */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <main className="flex-grow">
          <Outlet />
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} Recon AI. All rights reserved. Razorpay Buildathon 2026.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
