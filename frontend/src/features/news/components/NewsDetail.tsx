import React, { useState } from 'react';
import { FiCalendar, FiTag, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
import { NewsItem } from '../types';

interface NewsDetailProps {
  news: NewsItem;
  isAdmin?: boolean;
  onEdit: (news: NewsItem) => void;
  onDelete: (id: string) => void;
}

export const NewsDetail: React.FC<NewsDetailProps> = ({ news, isAdmin, onEdit, onDelete }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <div className="space-y-8 pb-4">
      {/* Gallery Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.images && news.images.length > 0 ? (
          news.images.map((img, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-xl border-2 border-gray-100 cursor-zoom-in group ${
                news.images?.length === 1 ? 'md:col-span-2 aspect-video' : 'aspect-square'
              }`}
              onClick={() => setZoomedImage(img.url ?? null)}
            >
              <img
                src={img.url}
                alt={`${news.title} - ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))
        ) : (
          <div className="md:col-span-2 aspect-video bg-gray-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
            <FiFileText className="w-12 h-12 text-gray-200 mb-2" />
            <span className="text-gray-400 font-medium">No images available</span>
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-teal-50 text-[#00C6A7] text-xs font-bold uppercase tracking-wider border border-teal-100 flex items-center gap-2">
              <FiTag /> {news.category}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100 flex items-center gap-2">
              <FiCalendar />{' '}
              {new Date(news.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">{news.title}</h2>
        </div>

        <div className="bg-gray-50 p-8 rounded-3xl border-2 border-gray-100">
          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
            {news.description}
          </p>
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-100">
          <button
            onClick={() => onEdit(news)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#181818] text-white rounded-xl font-bold hover:bg-[#00C6A7] transition-all shadow-lg shadow-gray-100"
          >
            <FiEdit2 /> Edit News
          </button>
          <button
            onClick={() => onDelete(news._id)}
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
