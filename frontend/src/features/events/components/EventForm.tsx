import React, { useState, useEffect } from 'react';
import { FiInfo, FiMapPin, FiTag, FiMail } from 'react-icons/fi';
import { ImageUpload, ImageFile } from '../../../components/common/ImageUpload';
import { Event } from '../types';
import { validateEmail, validatePhone, validateUrl } from '../../../utils/formValidation';

interface EventFormProps {
  event?: Event | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  isSubmitting,
  error: externalError,
}) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
    location: event?.location || '',
    status: event?.status || ('Upcoming' as Event['status']),
    registerUrl: event?.registerUrl || '',
    operatingHours: event?.operatingHours || '',
    contactInfo: {
      name: event?.contactInfo?.name || '',
      email: event?.contactInfo?.email || '',
      phone: event?.contactInfo?.phone || '',
    },
    mapLocation: {
      building: event?.mapLocation?.building || '',
      floor: event?.mapLocation?.floor || '',
      room: event?.mapLocation?.room || '',
    },
    images: event?.image?.url
      ? ([
          { url: event.image.url, public_id: event.image.public_id, previewUrl: event.image.url },
        ] as ImageFile[])
      : ([] as ImageFile[]),
  });

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
      case 'location':
        if (!value.trim()) return 'Location is required';
        return null;
      case 'date':
        if (!value) return 'Date is required';
        return null;
      case 'email':
        if (value && !validateEmail(value).isValid) return 'Invalid email format';
        return null;
      case 'phone':
        if (value && !validatePhone(value).isValid) return 'Invalid phone format';
        return null;
      case 'url':
        if (value && !validateUrl(value).isValid) return 'Invalid URL format';
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
    const locErr = validateField('location', formData.location);
    const dateErr = validateField('date', formData.date);
    const emailErr = validateField('email', formData.contactInfo.email);
    const phoneErr = validateField('phone', formData.contactInfo.phone);
    const urlErr = validateField('url', formData.registerUrl);

    if (titleErr) errors.title = titleErr;
    if (descErr) errors.description = descErr;
    if (locErr) errors.location = locErr;
    if (dateErr) errors.date = dateErr;
    if (emailErr) errors.email = emailErr;
    if (phoneErr) errors.phone = phoneErr;
    if (urlErr) errors.url = urlErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please fix the errors below');
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('date', formData.date);
    submitData.append('location', formData.location.trim());
    submitData.append('status', formData.status);
    submitData.append('registerUrl', formData.registerUrl.trim());
    submitData.append('operatingHours', formData.operatingHours.trim());
    submitData.append('contactInfo', JSON.stringify(formData.contactInfo));
    submitData.append('mapLocation', JSON.stringify(formData.mapLocation));

    if (formData.images.length > 0 && formData.images[0].file) {
      submitData.append('image', formData.images[0].file);
    } else if (event && formData.images.length === 0) {
      submitData.append('removeImage', 'true');
    }

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          <FiInfo className="text-[#00C6A7]" /> Event Information
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              onBlur={(e) => handleBlur('title', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                fieldErrors.title ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter event name"
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
              placeholder="Tell us about the event..."
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as Event['status'] }))
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Location & Time */}
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          <FiMapPin className="text-[#00C6A7]" /> Location & Time
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Venue Address/Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              onBlur={(e) => handleBlur('location', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                fieldErrors.location ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Where is the event?"
            />
            {fieldErrors.location && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.location}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Building</label>
              <input
                type="text"
                value={formData.mapLocation.building}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mapLocation: { ...prev.mapLocation, building: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                placeholder="e.g. Block A"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Floor</label>
              <input
                type="text"
                value={formData.mapLocation.floor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mapLocation: { ...prev.mapLocation, floor: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                placeholder="e.g. 2nd"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Room/Hall</label>
              <input
                type="text"
                value={formData.mapLocation.room}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mapLocation: { ...prev.mapLocation, room: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                placeholder="e.g. Auditorium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Operating Hours</label>
            <input
              type="text"
              value={formData.operatingHours}
              onChange={(e) => setFormData((prev) => ({ ...prev, operatingHours: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
              placeholder="e.g. 10:00 AM - 4:00 PM"
            />
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          <FiTag className="text-[#00C6A7]" /> Event Banner
        </h3>
        <ImageUpload
          images={formData.images}
          onImagesChange={(imgs: ImageFile[]) => setFormData((prev) => ({ ...prev, images: imgs }))}
          maxImages={1}
        />
      </div>

      {/* Registration & Contact */}
      <div className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          <FiMail className="text-[#00C6A7]" /> Registration & Contact
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Registration Link (URL)
            </label>
            <input
              type="text"
              value={formData.registerUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, registerUrl: e.target.value }))}
              onBlur={(e) => handleBlur('url', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] transition-all ${
                fieldErrors.url ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="https://..."
            />
            {fieldErrors.url && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.url}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contact Name</label>
              <input
                type="text"
                value={formData.contactInfo.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, name: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none"
                placeholder="Organizer name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contact Email</label>
              <input
                type="text"
                value={formData.contactInfo.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, email: e.target.value },
                  }))
                }
                onBlur={(e) => handleBlur('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="email@example.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
              <input
                type="text"
                value={formData.contactInfo.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, phone: e.target.value },
                  }))
                }
                onBlur={(e) => handleBlur('phone', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-50 focus:outline-none ${
                  fieldErrors.phone ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Phone number"
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.phone}</p>
              )}
            </div>
          </div>
        </div>
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
          {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};
