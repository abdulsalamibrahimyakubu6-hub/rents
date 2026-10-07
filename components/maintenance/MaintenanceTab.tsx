import React, { useState } from 'react';
import {
  MaintenanceRequest,
  Rental,
  MaintenanceRequestInput,
  MaintenanceRequestStatusEnum,
} from '../../lib/types';
import { StatusBadge } from '../common/StatusBadge';
import { MaintenanceFormModal } from './MaintenanceFormModal';
import {
  Wrench,
  Plus,
  Grid,
  List,
  User,
  Building2,
  Edit2,
  Trash2,
} from 'lucide-react';

interface MaintenanceTabProps {
  maintenance: MaintenanceRequest[];
  rentals: Rental[];
  loading: boolean;
  onCreateMaintenance: (data: MaintenanceRequestInput) => Promise<void>;
  onUpdateMaintenance: (
    id: number,
    data: Partial<MaintenanceRequestInput>
  ) => Promise<void>;
  onDeleteMaintenance: (id: number) => Promise<void>;
  searchQuery: string;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  maintenance,
  rentals,
  loading,
  onCreateMaintenance,
  onUpdateMaintenance,
  onDeleteMaintenance,
  searchQuery,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<MaintenanceRequest | null>(null);

  const filteredTickets = maintenance.filter((ticket) => {
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(q) ||
        ticket.property_title.toLowerCase().includes(q) ||
        ticket.tenant_username.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: { status: MaintenanceRequestStatusEnum; title: string; color: string }[] = [
    { status: 'pending', title: 'Pending / New', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
    { status: 'in_progress', title: 'In Progress', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
    { status: 'resolved', title: 'Resolved', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
    { status: 'cancelled', title: 'Cancelled', color: 'border-slate-700 text-slate-400 bg-slate-800/40' },
  ];

  const handleStatusChange = async (ticket: MaintenanceRequest, newStatus: MaintenanceRequestStatusEnum) => {
    await onUpdateMaintenance(ticket.id, { status: newStatus });
  };

  const handleFormSubmit = async (data: MaintenanceRequestInput, isEditId?: number) => {
    if (isEditId) {
      await onUpdateMaintenance(isEditId, data);
    } else {
      await onCreateMaintenance(data);
    }
    setEditingTicket(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  priorityFilter === p
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* View Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                viewMode === 'kanban' ? 'bg-slate-800 text-slate-100' : 'hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-slate-100' : 'hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingTicket(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Maintenance Request</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {columns.map((col) => {
            const colTickets = filteredTickets.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-4 min-h-[500px] flex flex-col justify-between"
              >
                <div>
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${col.color}`}>
                      {col.title}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-semibold">{colTickets.length}</span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3 mt-4">
                    {colTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 shadow-md space-y-3 group transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                            {ticket.title}
                          </h4>
                          <StatusBadge status={ticket.priority} className="shrink-0 text-[10px]" />
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {ticket.description}
                        </p>

                        <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="truncate">{ticket.property_title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{ticket.tenant_username}</span>
                          </div>
                        </div>

                        {/* Status Change Quick Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTicket(ticket);
                                setIsFormOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-400 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete maintenance ticket #${ticket.id}?`)) {
                                  onDeleteMaintenance(ticket.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Status Shift */}
                          {ticket.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(ticket, 'in_progress')}
                              className="text-[10px] font-semibold text-blue-400 hover:underline flex items-center gap-1"
                            >
                              Start Repair →
                            </button>
                          )}
                          {ticket.status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(ticket, 'resolved')}
                              className="text-[10px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              Mark Resolved ✓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {colTickets.length === 0 && (
                      <p className="text-[11px] text-slate-600 italic text-center py-8">
                        No tickets in this column
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-4">Ticket ID</th>
                  <th className="p-4">Title & Description</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Tenant</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-4 font-mono font-semibold text-amber-400">#{ticket.id}</td>
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-slate-100">{ticket.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{ticket.description}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">{ticket.property_title}</td>
                    <td className="p-4 text-slate-300">{ticket.tenant_username}</td>
                    <td className="p-4">
                      <StatusBadge status={ticket.priority} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTicket(ticket);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete maintenance ticket #${ticket.id}?`)) {
                              onDeleteMaintenance(ticket.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MaintenanceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTicket(null);
        }}
        onSubmit={handleFormSubmit}
        editingTicket={editingTicket}
        rentals={rentals}
      />
    </div>
  );
};
