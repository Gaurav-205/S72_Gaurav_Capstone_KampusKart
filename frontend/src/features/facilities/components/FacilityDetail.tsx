import React, { useState } from 'react';
import { FiMapPin, FiTag, FiCalendar, FiUser, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import { Facility } from '../types';
import { getIconByValue } from '../constants';

interface FacilityDetailProps {
  facility: Facility;
  isAdmin?: boolean;
  onEdit: (facility: Facility) => void;
  onDelete: (id: string) => void;
}

export const FacilityDetail: React.FC<FacilityDetailProps> = ({
  facility,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const iconOption = getIconByValue(facility.icon || 'MdSchool');

  return (
    <div className="space-y-8 pb-4">
      {/* Gallery Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facility.images && facility.images.length > 0 ? (
          facility.images.map((img, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-xl border-2 border-gray-100 cursor-zoom-in group ${
                facility.images?.length === 1 ? 'md:col-span-2 aspect-video' : 'aspect-square'
              }`}
              onClick={() => setZoomedImage(img.url ?? null)}
            >
              <img
                src={img.url}
                alt={`${facility.name} - ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))
        ) : (
          <div className="md:col-span-2 aspect-video bg-gray-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
            <div
              className={`p-6 rounded-2xl bg-white shadow-sm mb-4 ${iconOption?.color || 'text-gray-400'}`}
            >
              {iconOption?.icon || <MdSchool className="w-16 h-16" />}
            </div>
            <span className="text-gray-400 font-medium">No gallery images</span>
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-teal-50 text-[#00C6A7] text-xs font-bold uppercase tracking-wider border border-teal-100 flex items-center gap-2">
              <FiTag /> {facility.type}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100 flex items-center gap-2">
              <FiMapPin /> {facility.location}
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
            {facility.name}
          </h2>
          {facility.createdAt && (
            <div className="flex items-center text-gray-400 text-sm font-medium">
              <FiCalendar className="mr-2" />
              <span>
                Added on{' '}
                {new Date(facility.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
              </span>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-8 rounded-3xl border-2 border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FiFileText className="text-[#00C6A7]" /> About this Facility
          </h3>
          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
            {facility.description}
          </p>
        </div>

        {facility.createdBy && (
          <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-gray-100">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <FiUser className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Contributed By
              </p>
              <p className="text-gray-900 font-bold">
                {facility.createdBy.name || facility.createdBy.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-100">
          <button
            onClick={() => onEdit(facility)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#181818] text-white rounded-xl font-bold hover:bg-[#00C6A7] transition-all shadow-lg shadow-gray-100"
          >
            <FiEdit2 /> Edit Facility
          </button>
          <button
            onClick={() => onDelete(facility._id)}
            className="flex-none px-6 py-4 bg-white text-red-600 border-2 border-red-200 rounded-xl font-bold hover:bg-red-50 transition-all"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      )}

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
