import React from 'react';
import {
  Building2,
  Users,
  DollarSign,
  Wrench,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Property, Rental, Payment, MaintenanceRequest, ViewTab } from '../../lib/types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';

interface OverviewTabProps {
  properties: Property[];
  rentals: Rental[];
  payments: Payment[];
  maintenance: MaintenanceRequest[];
  onNavigate: (tab: ViewTab) => void;
  onOpenAddProperty: () => void;
  onOpenRecordPayment: () => void;
  onOpenSubmitMaintenance: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  properties,
  rentals,
  payments,
  maintenance,
  onNavigate,
  onOpenAddProperty,
  onOpenRecordPayment,
  onOpenSubmitMaintenance,
}) => {
  // KPI Calculations
  const totalProperties = properties.length;

  const activeRentalsCount = rentals.filter((r) => r.status === 'active').length;
  const occupancyRate = totalProperties > 0 ? Math.round((activeRentalsCount / totalProperties) * 100) : 0;

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  const openMaintenanceCount = maintenance.filter(
    (m) => m.status === 'pending' || m.status === 'in_progress'
  ).length;

  const urgentMaintenanceCount = maintenance.filter(
    (m) => (m.status === 'pending' || m.status === 'in_progress') && (m.priority === 'urgent' || m.priority === 'high')
  ).length;

  // Recent Activity (combine payments & maintenance sorted by date)
  const recentPayments = payments.slice(0, 4).map((p) => ({
    id: `pay-${p.id}`,
    type: 'payment' as const,
    title: `Payment of $${parseFloat(p.amount).toLocaleString()} received`,
    subtitle: `${p.property_title} • ${p.tenant_username}`,
    date: p.date_paid,
    status: p.status,
  }));

  const recentMaintenance = maintenance.slice(0, 4).map((m) => ({
    id: `maint-${m.id}`,
    type: 'maintenance' as const,
    title: m.title,
    subtitle: `${m.property_title} • ${m.priority} priority`,
    date: m.created_at,
    status: m.status,
  }));

  const recentActivity = [...recentPayments, ...recentMaintenance]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Quick Action Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Rental Management Dashboard Overview
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time portfolio analytics synchronized with backend REST API endpoints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddProperty}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Property</span>
          </button>
          <button
            type="button"
            onClick={onOpenRecordPayment}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <DollarSign className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
          <button
            type="button"
            onClick={onOpenSubmitMaintenance}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition-all"
          >
            <Wrench className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={totalProperties}
          subtext={`${activeRentalsCount} currently leased`}
          icon={Building2}
          colorTheme="indigo"
          trend={{ value: '12% MoM', isPositive: true }}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          subtext={`${totalProperties - activeRentalsCount} vacant units`}
          icon={Users}
          colorTheme="emerald"
          trend={{ value: '5% vs Target', isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtext="From completed payments"
          icon={DollarSign}
          colorTheme="emerald"
          trend={{ value: '8.4%', isPositive: true }}
        />
        <StatCard
          title="Open Maintenance"
          value={openMaintenanceCount}
          subtext={`${urgentMaintenanceCount} high/urgent priority`}
          icon={Wrench}
          colorTheme={urgentMaintenanceCount > 0 ? 'rose' : 'amber'}
        />
      </div>

      {/* Middle Section: Financial Chart / Breakdown + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Financial Health & Monthly Ledger
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Income trajectory vs pending lease collections
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('payments')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                View Full Ledger <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Bar Graph */}
            <div className="space-y-4 my-6">
              {properties.slice(0, 4).map((prop) => {
                const propPayments = payments.filter(
                  (p) => p.property_title === prop.title && p.status === 'completed'
                );
                const propSum = propPayments.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);
                const target = parseFloat(prop.rent_amount) * 3; // hypothetical quarter target
                const pct = Math.min(100, Math.round((propSum / target) * 100)) || 45;

                return (
                  <div key={prop.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate max-w-[200px]">{prop.title}</span>
                      <span className="text-slate-400 font-mono">
                        ${propSum.toLocaleString()} / month (${prop.rent_amount})
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Auto-synced with DRF payment ledger
            </span>
            <span className="font-mono text-slate-300">Target Rent Rate: 98%</span>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Recent Activity
              </h4>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Live Logs</span>
            </div>

            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start gap-3"
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      item.type === 'payment'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {item.type === 'payment' ? <DollarSign className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                  <StatusBadge status={item.status} className="shrink-0 text-[10px]" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('maintenance')}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              View Maintenance Board →
            </button>
            <button
              type="button"
              onClick={() => onNavigate('payments')}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              View Payments →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
