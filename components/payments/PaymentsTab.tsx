import React, { useState } from 'react';
import { Payment, Rental, PaymentInput, PaymentStatusEnum } from '../../lib/types';
import { StatusBadge } from '../common/StatusBadge';
import { SkeletonTableRow } from '../common/Skeleton';
import { PaymentFormModal } from './PaymentFormModal';
import {
  Plus,
  CreditCard,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface PaymentsTabProps {
  payments: Payment[];
  rentals: Rental[];
  loading: boolean;
  onCreatePayment: (data: PaymentInput) => Promise<void>;
  onUpdatePayment: (id: number, data: Partial<PaymentInput>) => Promise<void>;
  onDeletePayment: (id: number) => Promise<void>;
  searchQuery: string;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  payments,
  rentals,
  loading,
  onCreatePayment,
  onUpdatePayment,
  onDeletePayment,
  searchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatusEnum>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.property_title.toLowerCase().includes(q) ||
        p.tenant_username.toLowerCase().includes(q) ||
        (p.payment_method && p.payment_method.toLowerCase().includes(q)) ||
        String(p.id).includes(q) ||
        String(p.rental).includes(q)
      );
    }
    return true;
  });

  // Calculate summary totals
  const totalCompleted = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  const totalFailedCount = payments.filter((p) => p.status === 'failed').length;

  const handleFormSubmit = async (data: PaymentInput, isEditId?: number) => {
    if (isEditId) {
      await onUpdatePayment(isEditId, data);
    } else {
      await onCreatePayment(data);
    }
    setEditingPayment(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Financial Summary Header Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Revenue Collected</span>
            <h4 className="text-2xl font-extrabold text-emerald-400 mt-0.5">
              ${totalCompleted.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h4>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Pending Payments</span>
            <h4 className="text-2xl font-extrabold text-amber-400 mt-0.5">
              ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h4>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Failed Transactions</span>
            <h4 className="text-2xl font-extrabold text-rose-400 mt-0.5">{totalFailedCount} Alerts</h4>
          </div>
        </div>
      </div>

      {/* Action & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['all', 'completed', 'pending', 'failed'] as const).map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st} ({st === 'all' ? payments.length : payments.filter((p) => p.status === st).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingPayment(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Main Ledger Data Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-4">Tx ID</th>
                <th className="p-4">Lease & Property</th>
                <th className="p-4">Tenant Username</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Date Paid</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <>
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                </>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 italic">
                    No payment ledger records found matching parameters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-4 font-mono font-semibold text-indigo-400">#{pay.id}</td>
                    <td className="p-4 font-bold text-slate-100">
                      <div>
                        <span>{pay.property_title}</span>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          Rental #{pay.rental}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-200">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        {pay.tenant_username}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-emerald-400 text-sm">
                      ${parseFloat(pay.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {pay.payment_method || 'ACH Transfer'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {new Date(pay.date_paid).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={pay.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPayment(pay);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                          title="Edit Payment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete payment record #${pay.id}?`)) {
                              onDeletePayment(pay.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete Payment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPayment(null);
        }}
        onSubmit={handleFormSubmit}
        editingPayment={editingPayment}
        rentals={rentals}
      />
    </div>
  );
};
