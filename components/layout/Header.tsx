import React, { useState } from 'react';
import {
  Search,
  RotateCw,
  Server,
  Sparkles,
  LogOut,
  KeyRound,
  Menu,
  X,
} from 'lucide-react';
import { ViewTab, User } from '../../lib/types';

interface HeaderProps {
  currentTab: ViewTab;
  useMock: boolean;
  onToggleMock: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  user: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  useMock,
  onToggleMock,
  onRefreshData,
  isRefreshing,
  user,
  onOpenAuthModal,
  onLogout,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const titles: Record<ViewTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Dashboard Overview',
      subtitle: 'Real-time property metrics, revenue telemetry, and urgent maintenance alerts',
    },
    properties: {
      title: 'Property Management',
      subtitle: 'Manage property directory, view tenant details, and edit listings',
    },
    rentals: {
      title: 'Rentals & Tenancy Contracts',
      subtitle: 'Track active, pending, and expired lease agreements across properties',
    },
    payments: {
      title: 'Financial Ledger',
      subtitle: 'Audit tenant payment logs, record new transactions, and monitor revenue',
    },
    maintenance: {
      title: 'Maintenance Ticketing System',
      subtitle: 'Prioritize, dispatch, and track issue resolution on an interactive Kanban board',
    },
  };

  const { title, subtitle } = titles[currentTab] || titles.overview;

  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 py-3.5 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 -ml-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl md:hidden transition-colors shrink-0"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-slate-100 tracking-tight truncate">
              {title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block truncate">{subtitle}</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl md:hidden transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Global Search Input */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties, tenants..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* API Mode Toggle Switch */}
          <button
            type="button"
            onClick={onToggleMock}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all duration-300 ${
              useMock
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title="Toggle between Live DRF API server and Mock Demo mode"
          >
            {useMock ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Demo Mode</span>
                <span className="sm:hidden">Demo</span>
              </>
            ) : (
              <>
                <Server className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Live API</span>
                <span className="sm:hidden">Live</span>
              </>
            )}
          </button>

          {/* Refresh Data Button */}
          <button
            type="button"
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50 shrink-0"
            title="Refresh Data from API"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* User Auth Info / Login */}
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-800">
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs uppercase shrink-0">
                  {user.username.slice(0, 2)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-200">{user.username}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{user.role || 'Landlord'}</p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Logout / Clear Auth Token"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Connect API Auth</span>
                <span className="sm:hidden">Auth</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {showMobileSearch && (
        <div className="mt-3 pt-3 border-t border-slate-800 md:hidden flex items-center gap-2 animate-fadeIn">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties, tenants..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

