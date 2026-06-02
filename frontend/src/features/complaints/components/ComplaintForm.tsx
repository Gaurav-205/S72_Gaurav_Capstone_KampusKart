import React, { useState, useEffect } from 'react';
import { FiInfo } from 'react-icons/fi';
import { ImageUpload, ImageFile } from '../../../components/common/ImageUpload';
import { Complaint } from '../types';

interface ComplaintFormProps {
  complaint?: Complaint | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  isAdmin?: boolean;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  complaint,
  onSubmit,
  isSubmitting,
  error: externalError,
  isAdmin,
}) => {
  const [formData, setFormData] = useState({
    title: complaint?.title || '',
    description: complaint?.description || '',
    category: complaint?.category || ('Other' as Complaint['category']),
    priority: complaint?.priority || ('Medium' as Complaint['priority']),
    department: complaint?.department || ('Student Services' as Complaint['department']),
    status: complaint?.status || ('Open' as Complaint['status']),
    statusComment: '',
  });

  const [images, setImages] = useState<ImageFile[]>(
    (complaint?.images || []).map((img) => ({
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
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        return null;
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        return null;
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

    const titleErr = validateField('title', formData.title);
    const descErr = validateField('description', formData.description);

    if (titleErr) errors.title = titleErr;
    if (descErr) errors.description = descErr;

    if (
      isAdmin &&
      complaint &&
      formData.status !== complaint.status &&
      !formData.statusComment.trim()
    ) {
      setFormError('Please add a status update note when changing status.');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please fix the errors below');
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('category', formData.category);
    submitData.append('priority', formData.priority);
    submitData.append('department', formData.department);
    submitData.append('status', formData.status);

    if (isAdmin && complaint && formData.status !== complaint.status) {
      submitData.append('statusComment', formData.statusComment.trim());
    }

    images.forEach((img) => {
      if (img.file) submitData.append('images', img.file);
    });

    if (complaint) {
      const keepPublicIds = images.filter((img) => img.public_id).map((img) => img.public_id);
      submitData.append('keepImages', JSON.stringify(keepPublicIds));
    }

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          Complaint Details <FiInfo className="text-gray-400" />
        </h3>
        <div className="space-y-6">
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
              placeholder="Brief summary of the issue"
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
              placeholder="Describe the problem in detail..."
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as Complaint['category'],
                  }))
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
              >
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Facilities">Facilities</option>
                <option value="IT">IT</option>
                <option value="Security">Security</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    department: e.target.value as Complaint['department'],
                  }))
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
              >
                <option value="Academic Affairs">Academic Affairs</option>
                <option value="Administration">Administration</option>
                <option value="Facilities Management">Facilities Management</option>
                <option value="IT Services">IT Services</option>
                <option value="Security">Security</option>
                <option value="Student Services">Student Services</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as Complaint['priority'],
                  }))
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            {isAdmin && complaint && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Status (Admin Only)
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as Complaint['status'],
                    }))
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAdmin && complaint && formData.status !== complaint.status && (
        <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6">
          <label className="block text-sm font-bold text-blue-700 mb-2">Status Update Note *</label>
          <textarea
            value={formData.statusComment}
            onChange={(e) => setFormData((prev) => ({ ...prev, statusComment: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Explain why the status is being changed..."
            rows={3}
          />
        </div>
      )}

      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Images</h3>
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
          {isSubmitting ? 'Saving...' : complaint ? 'Update Complaint' : 'Submit Complaint'}
        </button>
      </div>
    </form>
  );
};
