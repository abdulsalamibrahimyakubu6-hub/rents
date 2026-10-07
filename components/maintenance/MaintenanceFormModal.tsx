import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import {
  Rental,
  MaintenanceRequest,
  MaintenanceRequestInput,
  PriorityEnum,
  MaintenanceRequestStatusEnum,
} from '../../lib/types';
import { Wrench, FileKey2 } from 'lucide-react';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaintenanceRequestInput, isEditId?: number) => Promise<void>;
  editingTicket: MaintenanceRequest | null;
  rentals: Rental[];
}

const getInitialMaintenanceForm = (editingTicket: MaintenanceRequest | null, rentals: Rental[]): MaintenanceRequestInput => {
  if (editingTicket) {
    return {
      rental: editingTicket.rental,
      title: editingTicket.title,
      description: editingTicket.description,
      priority: editingTicket.priority,
      status: editingTicket.status,
    };
  }
  return {
    rental: rentals[0]?.id || 201,
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
  };
};

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTicket,
  rentals,
}) => {
  const [formData, setFormData] = useState<MaintenanceRequestInput>(() => getInitialMaintenanceForm(editingTicket, rentals));
  const [loading, setLoading] = useState(false);
  const [prevEditing, setPrevEditing] = useState<MaintenanceRequest | null>(editingTicket);

  if (editingTicket !== prevEditing) {
    setPrevEditing(editingTicket);
    setFormData(getInitialMaintenanceForm(editingTicket, rentals));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData, editingTicket?.id);
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
      title={editingTicket ? 'Edit Maintenance Request' : 'Submit Maintenance Ticket'}
      subtitle={editingTicket ? `Updating Ticket #${editingTicket.id}` : 'Create request in api/maintenance/'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Rental Lease *</label>
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

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Title *</label>
          <div className="relative">
            <Wrench className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Leaking Kitchen Faucet / HVAC Malfunction"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Urgency Priority *</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['low', 'medium', 'high', 'urgent'] as PriorityEnum[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`py-2 text-xs font-semibold rounded-xl border capitalize ${
                    formData.priority === p
                      ? 'bg-amber-600 text-white border-amber-500 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ticket Status *</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['pending', 'in_progress', 'resolved', 'cancelled'] as MaintenanceRequestStatusEnum[]).map((st) => (
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
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Description *</label>
          <textarea
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the maintenance issue..."
            className="w-full p-3 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
          />
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
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Submitting...' : editingTicket ? 'Update Ticket' : 'Submit Maintenance Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
