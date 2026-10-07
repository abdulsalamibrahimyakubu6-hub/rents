import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

interface AlertBannerProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  message,
  onDismiss,
  className = '',
}) => {
  const styles = {
    error: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
      icon: XCircle,
      iconColor: 'text-rose-400',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    info: {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
      icon: Info,
      iconColor: 'text-indigo-400',
    },
  }[type];

  const Icon = styles.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm transition-all duration-300 ${styles.bg} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${styles.iconColor}`} />
      <div className="flex-1 text-slate-200">{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 hover:bg-slate-800/50 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Dismiss Alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
