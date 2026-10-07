import React, { useState } from 'react';
import { Rental, Property, RentalInput, RentalStatusEnum } from '../../lib/types';
import { StatusBadge } from '../common/StatusBadge';
import { SkeletonTableRow } from '../common/Skeleton';
import { RentalFormModal } from './RentalFormModal';
import {
  Plus,
  Calendar,
  Building2,
  User,
  Edit2,
  Trash2,
} from 'lucide-react';

interface RentalsTabProps {
  rentals: Rental[];
  properties: Property[];
  loading: boolean;
  onCreateRental: (data: RentalInput) => Promise<void>;
  onUpdateRental: (id: number, data: Partial<RentalInput>) => Promise<void>;
  onDeleteRental: (id: number) => Promise<void>;
  searchQuery: string;
}

export const RentalsTab: React.FC<RentalsTabProps> = ({
  rentals,
  properties,
  loading,
  onCreateRental,
  onUpdateRental,
  onDeleteRental,
  searchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | RentalStatusEnum>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);

  const filteredRentals = rentals.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.property_title.toLowerCase().includes(q) ||
        r.tenant_username.toLowerCase().includes(q) ||
        String(r.id).includes(q) ||
        String(r.property).includes(q)
      );
    }
    return true;
  });

  const handleFormSubmit = async (data: RentalInput, isEditId?: number) => {
    if (isEditId) {
      await onUpdateRental(isEditId, data);
    } else {
      await onCreateRental(data);
    }
    setEditingRental(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full custom-scrollbar">
          {(['all', 'active', 'pending', 'completed', 'canceled'] as const).map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st} ({st === 'all' ? rentals.length : rentals.filter((r) => r.status === st).length})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingRental(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all ml-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Lease Agreement</span>
        </button>
      </div>

      {/* Main Data Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-4">Lease ID</th>
                <th className="p-4">Target Property</th>
                <th className="p-4">Tenant Account</th>
                <th className="p-4">Contract Period</th>
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
              ) : filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                    No lease contracts found matching the selected status or query.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-4 font-mono font-semibold text-indigo-400">
                      Rental #{rental.id}
                    </td>
                    <td className="p-4 font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span>{rental.property_title}</span>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            Property PK #{rental.property}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-semibold">{rental.tenant_username}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {rental.start_date} → {rental.end_date}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={rental.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRental(rental);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                          title="Edit Contract"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete tenancy agreement #${rental.id}?`)) {
                              onDeleteRental(rental.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete Lease"
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

      <RentalFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRental(null);
        }}
        onSubmit={handleFormSubmit}
        editingRental={editingRental}
        properties={properties}
      />
    </div>
  );
};
