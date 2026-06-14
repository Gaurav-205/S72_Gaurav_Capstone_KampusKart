import React, { useState, useEffect } from 'react';
import { FiInfo } from 'react-icons/fi';
import { ImageUpload, ImageFile } from '../../../components/common/ImageUpload';
import { Facility } from '../types';
import { ICON_OPTIONS } from '../constants';

interface FacilityFormProps {
  facility?: Facility | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export const FacilityForm: React.FC<FacilityFormProps> = ({
  facility,
  onSubmit,
  isSubmitting,
  error: externalError,
}) => {
  const [formData, setFormData] = useState({
    name: facility?.name || '',
    description: facility?.description || '',
    location: facility?.location || '',
    type: facility?.type || ('Academic' as Facility['type']),
    icon: facility?.icon || 'MdSchool',
  });

  const [images, setImages] = useState<ImageFile[]>(
    (facility?.images || []).map((img) => ({
      previewUrl: img.url,
      public_id: img.public_id,
      url: img.url,
    }))
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(externalError);
  }, [externalError]);

  const validateField = (name: string, value: string): string | null => {
    if (!value.trim()) return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    return null;
  };

  const handleBlur = (name: string, value: string) => {
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const requiredFields = ['name', 'description', 'location'] as const;
    requiredFields.forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) errors[field] = err;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please fill in all required fields');
      return;
    }

    const submitData = new FormData();
    submitData.append('name', formData.name.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('location', formData.location.trim());
    submitData.append('type', formData.type);
    submitData.append('icon', formData.icon);

    images.forEach((img) => {
      if (img.file) submitData.append('images', img.file);
    });

    if (facility) {
      const keepPublicIds = images.filter((img) => img.public_id).map((img) => img.public_id);
      submitData.append('keepImages', JSON.stringify(keepPublicIds));
    }

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          Facility Details <FiInfo className="text-gray-400" />
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                onBlur={(e) => handleBlur('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                  fieldErrors.name ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="e.g. Main Library"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                onBlur={(e) => handleBlur('location', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                  fieldErrors.location ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="e.g. Block A, 1st Floor"
              />
              {fieldErrors.location && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.location}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              onBlur={(e) => handleBlur('description', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                fieldErrors.description ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Tell us more about this facility..."
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as Facility['type'] }))
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
              >
                <option value="Academic">Academic</option>
                <option value="Food">Food</option>
                <option value="Service">Service</option>
                <option value="Accommodation">Accommodation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Primary Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Choose Icon Representation
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, icon: opt.value }))}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                    formData.icon === opt.value
                      ? 'border-[#00C6A7] bg-[#00C6A7] text-white shadow-lg shadow-teal-100 scale-110'
                      : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600'
                  }`}
                  title={opt.label}
                >
                  {React.cloneElement(opt.icon as React.ReactElement, { className: 'w-6 h-6' })}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Gallery</h3>
        <ImageUpload images={images} onImagesChange={setImages} maxImages={6} />
      </div>

      {formError && (
        <div className="p-4 bg-red-50 border-2 border-red-100 rounded-lg text-red-700 text-sm font-medium">
          {formError}
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4 border-t-2 border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-[#181818] text-white font-bold rounded-lg hover:bg-[#00C6A7] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : facility ? 'Update Facility' : 'Add Facility'}
        </button>
      </div>
    </form>
  );
};
