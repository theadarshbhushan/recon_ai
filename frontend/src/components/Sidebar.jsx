import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Search, 
  Wrench, 
  Bot, 
  Zap, 
  LogOut,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const Sidebar = ({ collapsed = false, setCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSwitchAccount = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/exceptions', label: 'Exception Queue', icon: AlertTriangle },
    { path: '/dashboard/explorer', label: 'Batch Explorer', icon: Search },
    { path: '/dashboard/diagnostics', label: 'Hard Mode Diagnostics', icon: Wrench },
    { path: '/dashboard/benchmarks', label: 'Model Benchmarks', icon: Bot },
    { path: '/dashboard/live', label: 'Live Demo', icon: Zap }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 text-slate-900 flex flex-col justify-between z-40 transition-all duration-300 shadow-2xs ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Branding */}
      <div>
        <div className="h-20 px-5 flex items-center justify-between border-b border-slate-100">
          <Link
            to="/"
            title="Go to Landing Page"
            className="flex items-center space-x-3 overflow-hidden group"
          >
            <BrandLogo size={38} />
            {!collapsed && (
              <div className="transition-opacity duration-200">
                <div className="font-display font-black text-xl tracking-tight text-slate-900 flex items-center group-hover:text-blue-600 transition-colors">
                  Recon <span className="text-blue-600 ml-1">AI</span>
                  <span className="flex h-2 w-2 relative ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest -mt-0.5">
                  AI Finance Controller
                </div>
              </div>
            )}
          </Link>

          {setCollapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Navigation List in Slate & Electric Blue */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-black tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  } ${collapsed ? 'justify-center px-2.5' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User / Session Section with Switch Account */}
      <div className="p-4 border-t border-slate-100 space-y-2.5">
        {!collapsed && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
            <div className="overflow-hidden">
              <div className="text-xs font-black text-slate-900 truncate">
                {user?.full_name || 'Adarsh Auditor'}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1.5 truncate mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> {user?.email || 'auditor@razorpay.com'}
              </div>
            </div>
            <span className="rounded-full bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 border border-blue-200">
              JWT
            </span>
          </div>
        )}

        {/* Action Buttons: Switch Account and Logout */}
        <div className={`grid ${collapsed ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
          <button
            onClick={handleSwitchAccount}
            title="Switch Account (Redirect to Login)"
            className="w-full rounded-full bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 font-black text-[11px] py-2 px-3 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 text-blue-600" />
            {!collapsed && <span>Switch</span>}
          </button>

          <button
            onClick={handleLogout}
            title="Log out of session"
            className="w-full rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 font-black text-[11px] py-2 px-3 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
