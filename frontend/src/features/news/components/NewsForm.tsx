import React, { useState, useEffect } from 'react';
import { FiInfo, FiTag, FiCalendar, FiFileText } from 'react-icons/fi';
import { ImageUpload, ImageFile } from '../../../components/common/ImageUpload';
import { NewsItem } from '../types';

interface NewsFormProps {
  news?: NewsItem | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export const NewsForm: React.FC<NewsFormProps> = ({
  news,
  onSubmit,
  isSubmitting,
  error: externalError,
}) => {
  const [formData, setFormData] = useState({
    title: news?.title || '',
    description: news?.description || '',
    date: news?.date ? new Date(news.date).toISOString().split('T')[0] : '',
    category: news?.category || 'Campus',
  });

  const [images, setImages] = useState<ImageFile[]>(
    (news?.images || []).map((img) => ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const requiredFields = ['title', 'description', 'date'] as const;
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
    submitData.append('title', formData.title.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('date', formData.date);
    submitData.append('category', formData.category);

    images.forEach((img) => {
      if (img.file) submitData.append('images', img.file);
    });

    if (news) {
      const keepPublicIds = images.filter((img) => img.public_id).map((img) => img.public_id);
      submitData.append('keepImages', JSON.stringify(keepPublicIds));
    }

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          News Details <FiInfo className="text-gray-400" />
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                    fieldErrors.title ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="e.g. Campus Festival 2024"
                />
                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date *</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                    fieldErrors.date ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {fieldErrors.date && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.date}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                  fieldErrors.description ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Share the full story here..."
              />
              <FiFileText className="absolute left-3 top-4 text-gray-400" />
            </div>
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
            >
              <option value="Campus">Campus</option>
              <option value="Academic">Academic</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Achievements">Achievements</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Gallery</h3>
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
          {isSubmitting ? 'Saving...' : news ? 'Update News' : 'Add News'}
        </button>
      </div>
    </form>
  );
};
