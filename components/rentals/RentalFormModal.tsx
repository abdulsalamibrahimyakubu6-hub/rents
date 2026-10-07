import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Property, Rental, RentalInput, RentalStatusEnum } from '../../lib/types';
import { Building2, Calendar } from 'lucide-react';

interface RentalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RentalInput, isEditId?: number) => Promise<void>;
  editingRental: Rental | null;
  properties: Property[];
}

const getInitialRentalForm = (editingRental: Rental | null, properties: Property[]): RentalInput => {
  if (editingRental) {
    return {
      property: editingRental.property,
      start_date: editingRental.start_date,
      end_date: editingRental.end_date,
      status: editingRental.status,
    };
  }
  const today = new Date();
  const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  return {
    property: properties[0]?.id || 101,
    start_date: today.toISOString().split('T')[0],
    end_date: nextYear.toISOString().split('T')[0],
    status: 'active',
  };
};

export const RentalFormModal: React.FC<RentalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRental,
  properties,
}) => {
  const [formData, setFormData] = useState<RentalInput>(() => getInitialRentalForm(editingRental, properties));
  const [loading, setLoading] = useState(false);
  const [prevEditing, setPrevEditing] = useState<Rental | null>(editingRental);

  if (editingRental !== prevEditing) {
    setPrevEditing(editingRental);
    setFormData(getInitialRentalForm(editingRental, properties));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData, editingRental?.id);
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
      title={editingRental ? 'Edit Tenancy Agreement' : 'Create / Renew Tenancy Agreement'}
      subtitle={editingRental ? `Editing Lease Contract #${editingRental.id}` : 'Register lease in api/rentals/'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Target Property *</label>
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              required
              value={formData.property}
              onChange={(e) => setFormData({ ...formData, property: Number(e.target.value) })}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none capitalize"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} - {p.title} (${p.rent_amount}/mo)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lease Start Date *</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lease End Date *</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tenancy Contract Status *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['pending', 'active', 'completed', 'canceled'] as RentalStatusEnum[]).map((st) => (
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
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Processing...' : editingRental ? 'Update Contract' : 'Create Lease Agreement'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
