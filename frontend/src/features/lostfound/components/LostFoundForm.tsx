import React, { useState, useEffect } from 'react';
import { FiInfo } from 'react-icons/fi';
import { ImageUpload, ImageFile } from '../../../components/common/ImageUpload';
import { LostFoundItem } from '../types';
import { validateEmail, validatePhone } from '../../../utils/formValidation';

interface LostFoundFormProps {
  item?: LostFoundItem | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export const LostFoundForm: React.FC<LostFoundFormProps> = ({
  item,
  onSubmit,
  isSubmitting,
  error: externalError,
}) => {
  const [formData, setFormData] = useState({
    type: item?.type || 'lost',
    title: item?.title || '',
    description: item?.description || '',
    location: item?.location || '',
    date: item?.date ? new Date(item.date).toISOString().split('T')[0] : '',
    contact: item?.contact || '',
    images: (item?.images || []).map((img) => ({
      previewUrl: img.url,
      public_id: img.public_id,
      url: img.url,
    })) as ImageFile[],
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(externalError);
  }, [externalError]);

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'title': {
        if (!value.trim()) return 'Title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        return null;
      }
      case 'description': {
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        return null;
      }
      case 'date': {
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) return 'Date cannot be in the future';
        return null;
      }
      case 'contact': {
        if (!value.trim()) return 'Contact information is required';
        if (value.includes('@')) {
          const emailRes = validateEmail(value);
          if (!emailRes.isValid) return emailRes.error || 'Invalid email';
        } else {
          const phoneRes = validatePhone(value);
          if (!phoneRes.isValid) return phoneRes.error || 'Invalid phone';
        }
        return null;
      }
      default:
        return null;
    }
  };

  const handleBlur = (name: string, value: string) => {
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const requiredFields = ['title', 'description', 'date', 'contact'] as const;
    requiredFields.forEach((name) => {
      const error = validateField(name, formData[name]);
      if (error) errors[name] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please fix the errors below');
      return;
    }

    const submitData = new FormData();
    submitData.append('type', formData.type);
    submitData.append('title', formData.title.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('location', formData.location.trim());
    submitData.append('date', formData.date);
    submitData.append('contact', formData.contact.trim());

    formData.images.forEach((img) => {
      if (img.file) submitData.append('images', img.file);
    });

    if (item) {
      const keepPublicIds = formData.images
        .filter((img) => img.public_id)
        .map((img) => img.public_id);
      submitData.append('keepImages', JSON.stringify(keepPublicIds));
    }

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          Item Details <FiInfo className="text-gray-400" />
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Item Type</label>
            <div className="flex gap-4">
              {['lost', 'found'].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={formData.type === t}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as LostFoundItem['type'],
                      }))
                    }
                    className="w-4 h-4 text-[#00C6A7] focus:ring-[#00C6A7]"
                  />
                  <span className="text-sm font-semibold capitalize">{t} Item</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              onBlur={(e) => handleBlur('title', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                fieldErrors.title ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="What did you lose/find?"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              onBlur={(e) => handleBlur('description', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                fieldErrors.description ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Provide details like color, brand, etc."
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all"
                placeholder="Where?"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                onBlur={(e) => handleBlur('date', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                  fieldErrors.date ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {fieldErrors.date && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.date}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Images</h3>
        <ImageUpload
          images={formData.images}
          onImagesChange={(imgs: ImageFile[]) => setFormData((prev) => ({ ...prev, images: imgs }))}
          maxImages={4}
        />
      </div>

      <div className="border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Contact Information *</h3>
        <input
          type="text"
          value={formData.contact}
          onChange={(e) => setFormData((prev) => ({ ...prev, contact: e.target.value }))}
          onBlur={(e) => handleBlur('contact', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
            fieldErrors.contact ? 'border-red-500' : 'border-gray-200'
          }`}
          placeholder="Email or Phone Number"
        />
        {fieldErrors.contact && (
          <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.contact}</p>
        )}
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
          {isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Post Item'}
        </button>
      </div>
    </form>
  );
};
