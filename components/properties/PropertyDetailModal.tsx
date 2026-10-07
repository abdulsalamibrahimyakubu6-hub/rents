import React from 'react';
import { Modal } from '../common/Modal';
import { Property, Rental, MaintenanceRequest } from '../../lib/types';
import { StatusBadge } from '../common/StatusBadge';
import { MapPin, User, Calendar, Wrench } from 'lucide-react';

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  rentals: Rental[];
  maintenance: MaintenanceRequest[];
  onEdit: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  isOpen,
  onClose,
  property,
  rentals,
  maintenance,
  onEdit,
}) => {
  if (!property) return null;

  const activeRental = rentals.find(
    (r) => r.property === property.id && r.status === 'active'
  );

  const propertyTickets = maintenance.filter(
    (m) => m.property_title === property.title || m.rental === activeRental?.id
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property.title}
      subtitle={`Property #${property.id} • Managed by ${property.landlord_username}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Cover / Media Banner */}
        <div className="relative h-56 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <img
            src={property.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <StatusBadge status={activeRental ? 'occupied' : 'vacant'} className="mb-2" />
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {property.address}
              </p>
            </div>
            <div className="text-right bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700">
              <span className="text-[10px] uppercase text-slate-400 block font-mono">Monthly Rate</span>
              <span className="text-lg font-extrabold text-emerald-400">${property.rent_amount}</span>
            </div>
          </div>
        </div>

        {/* Overview Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
          <p className="text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
            {property.description || 'No detailed description provided for this property listing.'}
          </p>
        </div>

        {/* Associated Tenant & Active Lease Info */}
        <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Associated Tenancy Data</span>
            {activeRental && <StatusBadge status={activeRental.status} />}
          </h4>

          {activeRental ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Current Tenant</span>
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  {activeRental.tenant_username}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Contract Term</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {activeRental.start_date} → {activeRental.end_date}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Lease ID</span>
                <span className="font-mono text-indigo-300">Rental #{activeRental.id}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-2">
              No active tenant lease is currently registered for this property unit.
            </p>
          )}
        </div>

        {/* Historical Maintenance Records */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            Historical Maintenance Records ({propertyTickets.length})
          </h4>

          {propertyTickets.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {propertyTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{ticket.title}</span>
                      <StatusBadge status={ticket.priority} className="text-[10px]" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ticket.description}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              No maintenance requests logged for this property.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(property);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow"
          >
            Edit Property
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
