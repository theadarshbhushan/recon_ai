import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const navItems = [
    { path: '/', label: '📈 Overview' },
    { path: '/benchmarks', label: '🤖 Model Benchmarks' },
    { path: '/exceptions', label: '⚠️ Exception Queue' },
    { path: '/explorer', label: '🔍 Batch Explorer' },
    { path: '/diagnostics', label: '🛠️ Diagnostics' },
    { path: '/live', label: '⚡ Live Demo' }
  ];

  return (
    <nav className="bg-navy-900 border-b border-navy-700 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Info */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="dashboard">📊</span>
            <div>
              <div className="font-outfit font-extrabold text-xl tracking-tight text-white flex items-center">
                Recon <span className="text-indigo-500 ml-1">AI</span>
              </div>
              <div className="text-[0.65rem] text-navy-600 font-bold uppercase tracking-wider -mt-0.5">
                AI Finance Controller
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile indicator */}
          <div className="flex md:hidden items-center">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[0.7rem] font-semibold">
              Live
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
