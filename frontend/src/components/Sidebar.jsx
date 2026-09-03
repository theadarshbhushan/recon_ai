import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ collapsed = false, setCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard/overview', label: 'Overview', icon: '📊' },
    { path: '/dashboard/exceptions', label: 'Exception Queue', icon: '⚠️' },
    { path: '/dashboard/explorer', label: 'Batch Explorer', icon: '🔍' },
    { path: '/dashboard/diagnostics', label: 'Hard Mode Diagnostics', icon: '🛠️' },
    { path: '/dashboard/benchmarks', label: 'Model Benchmarks', icon: '🤖' },
    { path: '/dashboard/live', label: 'Live Demo', icon: '⚡' }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 text-slate-800 flex flex-col justify-between z-40 transition-all duration-300 shadow-xs ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Branding */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <Link
            to="/"
            title="Go to Landing Page"
            className="flex items-center space-x-3 overflow-hidden group"
          >
            <span className="text-2xl flex-shrink-0" role="img" aria-label="dashboard">
              📊
            </span>
            {!collapsed && (
              <div className="transition-opacity duration-200">
                <div className="font-outfit font-black text-lg tracking-tight text-slate-900 flex items-center group-hover:text-indigo-600 transition-colors">
                  Recon <span className="text-indigo-600 ml-1">AI</span>
                  <span className="flex h-2 w-2 relative ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="text-[0.6rem] text-slate-500 font-bold uppercase tracking-wider -mt-0.5">
                  AI Finance Controller
                </div>
              </div>
            )}
          </Link>

          {setCollapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-xs"
            >
              {collapsed ? '▶' : '◀'}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom User / Session Section */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {!collapsed && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-slate-900 truncate">
                {user?.full_name || 'Auditor Session'}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1.5 truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> {user?.email || 'Active Controller'}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Log out of session"
          className={`w-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all flex items-center gap-2 shadow-2xs ${
            collapsed ? 'justify-center' : 'justify-center'
          }`}
        >
          <span className="text-sm">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
