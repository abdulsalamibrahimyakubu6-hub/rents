import React, { useState } from 'react';
import { Property, Rental, MaintenanceRequest, PropertyInput } from '../../lib/types';
import { StatusBadge } from '../common/StatusBadge';
import { SkeletonPropertyGrid } from '../common/Skeleton';
import {
  Building2,
  Plus,
  Grid,
  List,
  MapPin,
  User,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { PropertyFormModal } from './PropertyFormModal';
import { PropertyDetailModal } from './PropertyDetailModal';

interface PropertiesTabProps {
  properties: Property[];
  rentals: Rental[];
  maintenance: MaintenanceRequest[];
  loading: boolean;
  onCreateProperty: (data: PropertyInput) => Promise<void>;
  onUpdateProperty: (id: number, data: Partial<PropertyInput>) => Promise<void>;
  onDeleteProperty: (id: number) => Promise<void>;
  searchQuery: string;
}

export const PropertiesTab: React.FC<PropertiesTabProps> = ({
  properties,
  rentals,
  maintenance,
  loading,
  onCreateProperty,
  onUpdateProperty,
  onDeleteProperty,
  searchQuery,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'vacant'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Determine occupied status for properties
  const isOccupied = (propId: number) =>
    rentals.some((r) => r.property === propId && r.status === 'active');

  const filteredProperties = properties.filter((prop) => {
    const occupied = isOccupied(prop.id);
    if (filterStatus === 'occupied' && !occupied) return false;
    if (filterStatus === 'vacant' && occupied) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        prop.title.toLowerCase().includes(q) ||
        prop.address.toLowerCase().includes(q) ||
        prop.landlord_username.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFormSubmit = async (data: PropertyInput, isEditId?: number) => {
    if (isEditId) {
      await onUpdateProperty(isEditId, data);
    } else {
      await onCreateProperty(data);
    }
    setEditingProperty(null);
  };

  if (loading) return <SkeletonPropertyGrid />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Controls Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Units ({properties.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('occupied')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterStatus === 'occupied'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Occupied
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('vacant')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterStatus === 'vacant'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vacant
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Layout Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-slate-100' : 'hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-slate-100' : 'hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingProperty(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 p-8 space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No properties found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No property listings match your search parameters or active filters.
          </p>
        </div>
      )}

      {/* Property Cards Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => {
            const occupied = isOccupied(prop.id);
            return (
              <div
                key={prop.id}
                className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img
                      src={
                        prop.image ||
                        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={occupied ? 'occupied' : 'vacant'} />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                      <span className="font-mono text-indigo-300">ID #{prop.id}</span>
                      <span className="text-emerald-400 font-extrabold text-base">
                        ${prop.rent_amount} <span className="text-[10px] font-normal text-slate-400">/mo</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors truncate">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      {prop.address}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {prop.description || 'No additional description provided.'}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    {prop.landlord_username}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedProperty(prop)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProperty(prop);
                        setIsFormOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Property"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete property listing "${prop.title}"?`)) {
                          onDeleteProperty(prop.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                  <th className="p-4">ID</th>
                  <th className="p-4">Property Title</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Monthly Rent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Landlord</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProperties.map((prop) => {
                  const occupied = isOccupied(prop.id);
                  return (
                    <tr key={prop.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-4 font-mono text-indigo-400 font-semibold">#{prop.id}</td>
                      <td className="p-4 font-bold text-slate-100">{prop.title}</td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">{prop.address}</td>
                      <td className="p-4 font-extrabold text-emerald-400">${prop.rent_amount}</td>
                      <td className="p-4">
                        <StatusBadge status={occupied ? 'occupied' : 'vacant'} />
                      </td>
                      <td className="p-4 text-slate-300">{prop.landlord_username}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedProperty(prop)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProperty(prop);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete property "${prop.title}"?`)) {
                                onDeleteProperty(prop.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <PropertyFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProperty(null);
        }}
        onSubmit={handleFormSubmit}
        editingProperty={editingProperty}
      />

      {/* Detail Modal */}
      <PropertyDetailModal
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        property={selectedProperty}
        rentals={rentals}
        maintenance={maintenance}
        onEdit={(prop) => {
          setEditingProperty(prop);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
};
