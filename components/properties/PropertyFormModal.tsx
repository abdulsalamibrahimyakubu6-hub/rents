import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Property, PropertyInput } from '../../lib/types';
import { Building2, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyInput, isEditId?: number) => Promise<void>;
  editingProperty: Property | null;
}

const getInitialFormData = (editingProperty: Property | null): PropertyInput => ({
  title: editingProperty?.title || '',
  description: editingProperty?.description || '',
  address: editingProperty?.address || '',
  rent_amount: editingProperty?.rent_amount || '2000.00',
  image: editingProperty?.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
});

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProperty,
}) => {
  const [formData, setFormData] = useState<PropertyInput>(() => getInitialFormData(editingProperty));
  const [loading, setLoading] = useState(false);
  const [prevEditing, setPrevEditing] = useState<Property | null>(editingProperty);

  // Sync state during render if editing target changed
  if (editingProperty !== prevEditing) {
    setPrevEditing(editingProperty);
    setFormData(getInitialFormData(editingProperty));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData, editingProperty?.id);
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
      title={editingProperty ? 'Edit Property Listing' : 'Add New Property'}
      subtitle={editingProperty ? `Updating Property #${editingProperty.id}` : 'Create entry in api/properties/'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Property Title *</label>
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Skyline Luxury Penthouse"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Full Address *</label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 742 Evergreen Terrace, Suite 400, NY"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Rent Amount ($) *</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.01"
                required
                value={formData.rent_amount}
                onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                placeholder="2500.00"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL (Media placeholder)</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Property Description</label>
          <textarea
            rows={3}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe key features, bedrooms, amenities..."
            className="w-full p-3 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Saving...' : editingProperty ? 'Update Property' : 'Create Property'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
