import React, { useState, useEffect } from 'react';
import { FiInfo } from 'react-icons/fi';
import { ImageUpload, ImageFile } from '../../../components/common/ImageUpload';
import { Club } from '../types';

interface ClubFormProps {
  club?: Club | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export const ClubForm: React.FC<ClubFormProps> = ({
  club,
  onSubmit,
  isSubmitting,
  error: externalError,
}) => {
  const [formData, setFormData] = useState({
    title: club?.title || '',
    description: club?.description || '',
    clubName: club?.clubName || '',
    startDate: club?.startDate ? new Date(club.startDate).toISOString().split('T')[0] : '',
    endDate: club?.endDate ? new Date(club.endDate).toISOString().split('T')[0] : '',
    formUrl: club?.formUrl || '',
    status: club?.status || ('Open' as Club['status']),
    contactInfo: {
      name: club?.contactInfo?.name || '',
      email: club?.contactInfo?.email || '',
      phone: club?.contactInfo?.phone || '',
    },
  });

  const [images, setImages] = useState<ImageFile[]>(
    club?.image?.url
      ? [{ url: club.image.url, public_id: club.image.public_id, previewUrl: club.image.url }]
      : []
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(externalError);
  }, [externalError]);

  const validateField = (name: string, value: string): string | null => {
    if (typeof value === 'string' && !value.trim())
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const requiredFields = [
      'title',
      'description',
      'clubName',
      'startDate',
      'endDate',
      'formUrl',
    ] as const;
    requiredFields.forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) errors[field] = err;
    });

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      errors.endDate = 'End date must be after start date';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please fix the errors below');
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('clubName', formData.clubName.trim());
    submitData.append('startDate', formData.startDate);
    submitData.append('endDate', formData.endDate);
    submitData.append('formUrl', formData.formUrl.trim());
    submitData.append('status', formData.status);
    submitData.append('contactInfo', JSON.stringify(formData.contactInfo));

    if (images.length > 0 && images[0].file) {
      submitData.append('image', images[0].file);
    }

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          Recruitment Details <FiInfo className="text-gray-400" />
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                  fieldErrors.title ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="e.g. Drama Club 2024 Intake"
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Club Name *</label>
              <input
                type="text"
                value={formData.clubName}
                onChange={(e) => setFormData((prev) => ({ ...prev, clubName: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                  fieldErrors.clubName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Which club is recruiting?"
              />
              {fieldErrors.clubName && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.clubName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                  fieldErrors.startDate ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {fieldErrors.startDate && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                  fieldErrors.endDate ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {fieldErrors.endDate && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.endDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                fieldErrors.description ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Requirements, process, highlights..."
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Form URL *</label>
              <input
                type="url"
                value={formData.formUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, formUrl: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                  fieldErrors.formUrl ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="https://forms.gle/..."
              />
              {fieldErrors.formUrl && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.formUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as Club['status'] }))
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          Contact Person
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input
            type="text"
            value={formData.contactInfo.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, name: e.target.value },
              }))
            }
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C6A7] outline-none"
            placeholder="Name"
          />
          <input
            type="email"
            value={formData.contactInfo.email}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, email: e.target.value },
              }))
            }
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C6A7] outline-none"
            placeholder="Email"
          />
          <input
            type="tel"
            value={formData.contactInfo.phone}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, phone: e.target.value },
              }))
            }
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C6A7] outline-none"
            placeholder="Phone"
          />
        </div>
      </div>

      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Banner Image</h3>
        <ImageUpload images={images} onImagesChange={setImages} maxImages={3} />
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
          {isSubmitting ? 'Saving...' : club ? 'Update Recruitment' : 'Add Recruitment'}
        </button>
      </div>
    </form>
  );
};
