import React from 'react';

type BadgeType =
  | 'active'
  | 'pending'
  | 'completed'
  | 'canceled'
  | 'failed'
  | 'in_progress'
  | 'resolved'
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'occupied'
  | 'vacant';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toLowerCase() as BadgeType;

  let bgStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotStyle = 'bg-slate-400';
  let label = status.replace('_', ' ');

  switch (normalized) {
    case 'active':
    case 'completed':
    case 'resolved':
    case 'occupied':
      bgStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      dotStyle = 'bg-emerald-400';
      break;

    case 'pending':
    case 'medium':
    case 'in_progress':
      bgStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      dotStyle = 'bg-amber-400 animate-pulse';
      break;

    case 'high':
    case 'urgent':
    case 'failed':
    case 'canceled':
      bgStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      dotStyle = 'bg-rose-400';
      break;

    case 'low':
    case 'vacant':
      bgStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      dotStyle = 'bg-blue-400';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize tracking-wide ${bgStyle} ${className}`}>
    
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
      {label}
    </span>
  );
};
