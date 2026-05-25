import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { eventsApi } from '../api';
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiEdit2,
  FiTrash2,
  FiFileText,
} from 'react-icons/fi';
import { Event } from '../types';
import { UI_PATTERNS } from '../../../theme/uiPatterns';

interface EventDetailProps {
  event: Event;
  isAdmin?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (id: string) => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({ event, isAdmin, onEdit, onDelete }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const { token } = useAuth();

  const [isRegistered, setIsRegistered] = useState(event.isRegistered || false);

  const [registrationLoading, setRegistrationLoading] = useState(false);
  const handleRegistration = async () => {
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      setRegistrationLoading(true);

      if (isRegistered) {
        await eventsApi.withdrawRegistration(token, event._id);
        setIsRegistered(false);
      } else {
        await eventsApi.registerForEvent(token, event._id);
        setIsRegistered(true);
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setRegistrationLoading(false);
    }
  };
  const renderStatus = (status: Event['status']) => {
    let bgColorClass;
    let textColorClass;
    switch (status) {
      case 'Upcoming':
        bgColorClass = 'bg-blue-100';
        textColorClass = 'text-blue-800';
        break;
      case 'Ongoing':
        bgColorClass = 'bg-green-100';
        textColorClass = 'text-green-800';
        break;
      case 'Completed':
        bgColorClass = 'bg-gray-100';
        textColorClass = 'text-gray-800';
        break;
      case 'Cancelled':
        bgColorClass = 'bg-red-100';
        textColorClass = 'text-red-800';
        break;
      default:
        bgColorClass = 'bg-gray-100';
        textColorClass = 'text-gray-800';
    }
    return (
      <span
        className={`text-xs px-3 py-1.5 rounded-lg font-medium ${bgColorClass} ${textColorClass}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-4">
      {/* Header Section with Image and Key Info */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 flex-shrink-0">
          {event.image?.url ? (
            <div
              className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-100 cursor-zoom-in group"
              onClick={() => setZoomedImage(event.image?.url || null)}
            >
              <img
                src={event.image.url}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
              <FiCalendar className="w-12 h-12 text-gray-200 mb-2" />
              <span className="text-gray-400 font-medium">No image available</span>
            </div>
          )}
        </div>

        <div className="flex-grow space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {renderStatus(event.status)}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
              {event.title}
            </h2>
            <div className="flex items-center text-gray-500 text-sm font-medium">
              <FiCalendar className="mr-2" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <FiMapPin className="mr-3 text-[#00C6A7] w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">{event.location}</span>
            </div>
            {event.operatingHours && (
              <div className="flex items-center text-gray-700">
                <FiClock className="mr-3 text-[#00C6A7] w-5 h-5 flex-shrink-0" />
                <span>{event.operatingHours}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-3">
            {event.registerUrl && (
              <a
                href={event.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full ${UI_PATTERNS.buttonPrimary} text-center py-4 rounded-xl text-lg`}
              >
                Open Registration Link
              </a>
            )}

            <button
              onClick={handleRegistration}
              disabled={registrationLoading}
              className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
                isRegistered
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-[#00C6A7] text-white hover:opacity-90'
              }`}
            >
              {registrationLoading
                ? 'Please wait...'
                : isRegistered
                  ? 'Withdraw Registration'
                  : 'Register for Event'}
            </button>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FiFileText className="text-[#00C6A7]" /> Event Description
            </h3>
            <p className="text-gray-600 leading-relaxed bg-white p-6 rounded-2xl border-2 border-gray-100 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {(event.mapLocation?.building || event.mapLocation?.floor || event.mapLocation?.room) && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FiMapPin className="text-[#00C6A7]" /> Precise Location
              </h3>
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 grid grid-cols-1 gap-4">
                {event.mapLocation.building && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Building</span>
                    <span className="text-gray-900 font-bold">{event.mapLocation.building}</span>
                  </div>
                )}
                {event.mapLocation.floor && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Floor</span>
                    <span className="text-gray-900 font-bold">{event.mapLocation.floor}</span>
                  </div>
                )}
                {event.mapLocation.room && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Room/Hall</span>
                    <span className="text-gray-900 font-bold">{event.mapLocation.room}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FiUser className="text-[#00C6A7]" /> Contact Information
            </h3>
            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 space-y-4">
              {event.contactInfo?.name && (
                <div className="flex items-center gap-3">
                  <FiUser className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                      Name
                    </p>
                    <p className="text-gray-900 font-bold">{event.contactInfo.name}</p>
                  </div>
                </div>
              )}
              {event.contactInfo?.email && (
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                      Email
                    </p>
                    <a
                      href={`mailto:${event.contactInfo.email}`}
                      className="text-[#00C6A7] font-bold hover:underline"
                    >
                      {event.contactInfo.email}
                    </a>
                  </div>
                </div>
              )}
              {event.contactInfo?.phone && (
                <div className="flex items-center gap-3">
                  <FiPhone className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                      Phone
                    </p>
                    <a
                      href={`tel:${event.contactInfo.phone}`}
                      className="text-[#00C6A7] font-bold hover:underline"
                    >
                      {event.contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}
              {!event.contactInfo?.name &&
                !event.contactInfo?.email &&
                !event.contactInfo?.phone && (
                  <p className="text-gray-400 italic text-center py-2">No contact info provided</p>
                )}
            </div>
          </div>

          {isAdmin && (
            <div className="pt-6 border-t-2 border-gray-100 flex flex-wrap gap-4">
              <button
                onClick={() => onEdit?.(event)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <FiEdit2 /> Edit Event
              </button>
              <button
                onClick={() => onDelete?.(event._id)}
                className="flex-none px-6 py-4 bg-white text-red-600 border-2 border-red-200 rounded-xl font-bold hover:bg-red-50 transition-all"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
};
