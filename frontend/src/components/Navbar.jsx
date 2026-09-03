import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navItems = [
    { path: '/', label: 'Overview' },
    { path: '/exceptions', label: 'Exception Queue' },
    { path: '/explorer', label: 'Batch Explorer' },
    { path: '/diagnostics', label: 'Diagnostics' },
    { path: '/benchmarks', label: 'Benchmarks' },
    { path: '/live', label: 'Live Demo' }
  ];

  return (
    <nav className="bg-[#0A2540] border-b border-slate-700 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Info */}
          <div className="flex items-center space-x-3">
            <BrandLogo size={34} />
            <div>
              <div className="font-display font-black text-xl tracking-tight text-white flex items-center">
                Recon <span className="text-[#C9A227] ml-1">AI</span>
                <span className="flex h-2 w-2 relative ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider -mt-0.5">
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
                  `px-3 py-2 rounded-full text-xs font-black transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#C9A227] text-[#0A2540]'
                      : 'text-slate-300 hover:bg-[#14375A] hover:text-white'
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
              <div className="text-[10px] text-slate-400 -mt-0.5">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="bg-[#14375A] hover:bg-rose-900 border border-slate-600 hover:border-rose-700 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
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
