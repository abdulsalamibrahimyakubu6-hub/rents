import React from 'react';
import {
  LayoutDashboard,
  Building2,
  FileKey2,
  DollarSign,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
} from 'lucide-react';
import { ViewTab } from '../../lib/types';

interface SidebarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  stats: {
    openMaintenance: number;
    pendingRentals: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
  stats,
}) => {
  const navItems = [
    {
      id: 'overview' as ViewTab,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'properties' as ViewTab,
      label: 'Properties',
      icon: Building2,
    },
    {
      id: 'rentals' as ViewTab,
      label: 'Rentals & Leases',
      icon: FileKey2,
      badge: stats.pendingRentals > 0 ? stats.pendingRentals : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'payments' as ViewTab,
      label: 'Financial Ledger',
      icon: DollarSign,
    },
    {
      id: 'maintenance' as ViewTab,
      label: 'Maintenance System',
      icon: Wrench,
      badge: stats.openMaintenance > 0 ? stats.openMaintenance : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
  ];

  const handleSelectTab = (tab: ViewTab) => {
    onTabChange(tab);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const renderNavContent = (isMobileView = false) => (
    <div className="flex flex-col justify-between h-full">
      {/* Top Branding Section */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
          {!collapsed || isMobileView ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-slate-100 tracking-tight flex items-center gap-1">
                  APEX RENTS
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    DRF
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">Rental Management API</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}

          {!isMobileView ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors hidden md:block"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-500/80 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={collapsed && !isMobileView ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {(!collapsed || isMobileView) && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {(!collapsed || isMobileView) && item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-bold ${
                      item.badgeColor || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Info */}
      {(!collapsed || isMobileView) && (
        <div className="p-4 m-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> API Target
            </span>
            <span className="text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              REST v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate" title="https://rent-api-xjs4.onrender.com/">
            rent-api-xjs4.onrender.com
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        className={`hidden md:flex relative bg-slate-900 border-r border-slate-800 transition-all duration-300 flex-col justify-between z-30 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobile Off-Canvas Drawer Backdrop & Container */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
            onClick={onMobileClose}
          />

          {/* Drawer Sidebar */}
          <aside className="relative w-72 bg-slate-900 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-fadeIn">
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

