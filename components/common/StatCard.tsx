import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorTheme?: 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  colorTheme = 'indigo',
}) => {
  const themeStyles = {
    emerald: {
      bgIcon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'from-emerald-500/10 via-transparent to-transparent',
    },
    amber: {
      bgIcon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'from-amber-500/10 via-transparent to-transparent',
    },
    indigo: {
      bgIcon: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'from-indigo-500/10 via-transparent to-transparent',
    },
    rose: {
      bgIcon: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'from-rose-500/10 via-transparent to-transparent',
    },
    sky: {
      bgIcon: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      glow: 'from-sky-500/10 via-transparent to-transparent',
    },
  }[colorTheme];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl shadow-xl hover:border-slate-700 transition-all duration-300 group">
      {/* Background Subtle Gradient Glow */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br ${themeStyles.glow} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-50 mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${themeStyles.bgIcon} transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded ${
                trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {subtext && <span className="text-slate-400">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
