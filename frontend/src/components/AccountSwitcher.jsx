import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronsUpDown, 
  UserPlus, 
  LogOut, 
  Check, 
  Plus, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getKnownAccounts, 
  getAvatarStyle, 
  getInitial, 
  saveKnownAccount 
} from '../utils/accountUtils';

/**
 * AccountSwitcher component inspired by Google's account switcher.
 * Provides a profile trigger with dropdown to view current account,
 * switch between previously-used accounts, add a new account, or logout.
 */
const AccountSwitcher = ({ collapsed = false }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [knownAccounts, setKnownAccounts] = useState([]);
  const dropdownRef = useRef(null);

  // Synchronize known accounts list whenever dropdown opens or user changes
  useEffect(() => {
    if (user) {
      saveKnownAccount(user);
    }
    setKnownAccounts(getKnownAccounts());
  }, [user, isOpen]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handlePointerDownOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDownOutside);
      document.addEventListener('touchstart', handlePointerDownOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentEmail = user?.email || 'auditor@razorpay.com';
  const currentName = user?.full_name || 'Adarsh Auditor';
  const currentAvatarStyle = getAvatarStyle(currentEmail);
  const currentInitial = getInitial(currentName, currentEmail);

  // Other known accounts excluding the active logged-in user
  const otherAccounts = knownAccounts.filter(
    (acc) => acc.email?.toLowerCase().trim() !== currentEmail.toLowerCase().trim()
  );

  const handleSwitchToAccount = (account) => {
    setIsOpen(false);
    // Clear session and navigate to /login with email prefilled
    logout('/login', { state: { email: account.email } });
  };

  const handleAddAccount = () => {
    setIsOpen(false);
    // Clear session and navigate to /login with clean blank form
    logout('/login', { state: { addAccount: true } });
  };

  const handleLogout = () => {
    setIsOpen(false);
    // Complete logout and redirect to Landing page per specification
    logout('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ------------------------------------------------------------- */}
      {/* Dropdown Menu (Floating popover above the bottom trigger)     */}
      {/* ------------------------------------------------------------- */}
      {isOpen && (
        <div
          className={`absolute bottom-full mb-3 ${
            collapsed
              ? 'left-full ml-3 w-80'
              : 'left-0 right-0 sm:w-80'
          } bg-white border border-slate-200/90 shadow-2xl rounded-2xl p-4 z-50 text-slate-900 transition-all duration-150 animate-in fade-in zoom-in-95`}
          style={{ maxHeight: '85vh', overflowY: 'auto' }}
        >
          {/* Header Section: Active Current User (Google-style) */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5 mb-3">
            <div className="flex items-center gap-3">
              {/* Large Avatar with Active Indicator Ring */}
              <div className="relative flex-shrink-0">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-lg text-white shadow-xs ring-2 ring-offset-2 ring-blue-600 ${currentAvatarStyle.bg}`}
                  style={{ backgroundColor: currentAvatarStyle.hex }}
                >
                  {currentInitial}
                </div>
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              {/* User Details */}
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-black text-slate-900 truncate">
                  {currentName}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {currentEmail}
                </div>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Active Session</span>
                </div>
              </div>
            </div>
          </div>

          {/* Other Accounts Section */}
          {otherAccounts.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2.5 mb-1.5">
                Other Accounts on Device
              </div>
              <div className="space-y-1">
                {otherAccounts.map((account) => {
                  const style = getAvatarStyle(account.email);
                  const initial = getInitial(account.full_name, account.email);
                  return (
                    <button
                      key={account.email}
                      onClick={() => handleSwitchToAccount(account)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center font-black text-xs text-white flex-shrink-0 shadow-2xs"
                          style={{ backgroundColor: style.hex }}
                        >
                          {initial}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                            {account.full_name || account.email}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium truncate">
                            {account.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Switch <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Another Account Option */}
          <div className="border-t border-slate-100 pt-2 mb-2">
            <button
              onClick={handleAddAccount}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full border-2 border-dashed border-slate-300 group-hover:border-blue-500 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors flex-shrink-0">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Add another account
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Sign in with a different work email
                </div>
              </div>
            </button>
          </div>

          {/* Logout Option at Bottom */}
          <div className="border-t border-slate-100 pt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left p-2 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-all flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-slate-100 group-hover:bg-rose-100 flex items-center justify-center text-slate-500 group-hover:text-rose-600 transition-colors flex-shrink-0">
                <LogOut className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold transition-colors">
                  Log out of Recon AI
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  End session and return to home page
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Trigger: Profile Card (Avatar + Name + Email + Chevron)       */}
      {/* ------------------------------------------------------------- */}
      {collapsed ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={`Active account: ${currentName} (${currentEmail}) — click to switch`}
          className="w-full flex items-center justify-center p-2 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer relative"
        >
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xs ring-2 ring-offset-2 ring-blue-600 ${currentAvatarStyle.bg}`}
            style={{ backgroundColor: currentAvatarStyle.hex }}
          >
            {currentInitial}
          </div>
          <span className="absolute bottom-2.5 right-2.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Click to view and switch accounts"
          className={`w-full bg-slate-50 hover:bg-slate-100/90 border ${
            isOpen ? 'border-blue-500/50 ring-2 ring-blue-500/10' : 'border-slate-200/90'
          } rounded-2xl p-2.5 flex items-center justify-between gap-2.5 shadow-2xs transition-all cursor-pointer text-left group`}
        >
          {/* Avatar + Name + Email */}
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="relative flex-shrink-0">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center font-black text-xs text-white shadow-2xs ${currentAvatarStyle.bg}`}
                style={{ backgroundColor: currentAvatarStyle.hex }}
              >
                {currentInitial}
              </div>
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
            </div>

            <div className="overflow-hidden min-w-0 flex-1">
              <div className="text-xs font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {currentName}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 truncate mt-0.5">
                <span className="truncate">{currentEmail}</span>
              </div>
            </div>
          </div>

          {/* Chevron Indicator */}
          <div className="flex items-center gap-1 flex-shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors">
            <span className="rounded-full bg-blue-50 text-blue-700 text-[9px] font-black px-1.5 py-0.5 border border-blue-200">
              JWT
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </div>
        </button>
      )}
    </div>
  );
};

export default AccountSwitcher;
