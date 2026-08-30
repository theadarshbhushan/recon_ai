import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
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
                <span className="flex h-2.5 w-2.5 relative ml-2 mt-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
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

          {/* User Session Info & Logout Button */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs font-bold text-white">{user?.full_name || 'Auditor'}</div>
              <div className="text-[10px] text-gray-400 -mt-0.5">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="bg-navy-800 hover:bg-rose-900 border border-navy-700 hover:border-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors"
            >
              Logout 📤
            </button>
          </div>

          {/* Mobile indicator */}
          <div className="flex md:hidden items-center space-x-3">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[0.7rem] font-semibold">
              Live
            </span>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white text-xs font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
