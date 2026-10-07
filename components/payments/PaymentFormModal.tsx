import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Rental, Payment, PaymentInput, PaymentStatusEnum } from '../../lib/types';
import { DollarSign, FileKey2, CreditCard } from 'lucide-react';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentInput, isEditId?: number) => Promise<void>;
  editingPayment: Payment | null;
  rentals: Rental[];
}

const getInitialPaymentForm = (editingPayment: Payment | null, rentals: Rental[]): PaymentInput => {
  if (editingPayment) {
    return {
      rental: editingPayment.rental,
      amount: editingPayment.amount,
      payment_method: editingPayment.payment_method || 'ACH Bank Transfer',
      status: editingPayment.status,
      date_paid: editingPayment.date_paid,
    };
  }
  return {
    rental: rentals[0]?.id || 201,
    amount: '1500.00',
    payment_method: 'ACH Bank Transfer',
    status: 'completed',
    date_paid: new Date().toISOString(),
  };
};

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPayment,
  rentals,
}) => {
  const [formData, setFormData] = useState<PaymentInput>(() => getInitialPaymentForm(editingPayment, rentals));
  const [loading, setLoading] = useState(false);
  const [prevEditing, setPrevEditing] = useState<Payment | null>(editingPayment);

  if (editingPayment !== prevEditing) {
    setPrevEditing(editingPayment);
    setFormData(getInitialPaymentForm(editingPayment, rentals));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData, editingPayment?.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPayment ? 'Edit Payment Record' : 'Record Tenant Payment'}
      subtitle={editingPayment ? `Updating Payment #${editingPayment.id}` : 'Post transaction into api/payments/'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Target Lease Agreement *</label>
          <div className="relative">
            <FileKey2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              required
              value={formData.rental}
              onChange={(e) => setFormData({ ...formData, rental: Number(e.target.value) })}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              {rentals.map((r) => (
                <option key={r.id} value={r.id}>
                  Rental #{r.id} - {r.property_title} ({r.tenant_username})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Amount ($) *</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1500.00"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
            <div className="relative">
              <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="ACH Bank Transfer">ACH Bank Transfer</option>
                <option value="Credit Card (Visa/MC)">Credit Card (Visa/MC)</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Wire Transfer">Wire Transfer</option>
                <option value="Check">Personal / Cashier Check</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Status *</label>
          <div className="grid grid-cols-3 gap-2">
            {(['completed', 'pending', 'failed'] as PaymentStatusEnum[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFormData({ ...formData, status: st })}
                className={`py-2 text-xs font-semibold rounded-xl border capitalize ${
                  formData.status === st
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Processing...' : editingPayment ? 'Update Payment' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
