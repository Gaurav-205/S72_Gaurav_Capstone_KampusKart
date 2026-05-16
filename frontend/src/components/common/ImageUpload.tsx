import React, { useRef, useState, useEffect } from 'react';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import { validateFileSize, validateFileType } from '../../utils/formValidation';

export interface ImageFile {
  file?: File;
  previewUrl?: string;
  url?: string;
  public_id?: string;
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  single?: boolean;
  label?: string;
  helpText?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * Reusable image upload component
 * Supports single or multiple image uploads with preview and drag & drop
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 5,
  single = false,
  label = 'Images',
  helpText,
  disabled = false,
  id = 'image-upload',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  const isMaxReached = single ? images.length >= 1 : images.length >= maxImages;

  // ── Prevent browser from opening dropped images as a new page ──────────────
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    document.addEventListener('dragover', prevent);
    document.addEventListener('drop', prevent);
    return () => {
      document.removeEventListener('dragover', prevent);
      document.removeEventListener('drop', prevent);
    };
  }, []);

  // ── Click to open file picker ──────────────────────────────────────────────
  const handleUploadClick = () => {
    if (disabled || isMaxReached) return;
    fileInputRef.current?.click();
  };

  // ── Input file change ──────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled) return;

    const filesArray = Array.from(e.target.files);
    const remainingSlots = single ? 1 : maxImages - images.length;
    const filesToAdd = filesArray.slice(0, remainingSlots);

    const newImages: ImageFile[] = [];

    for (const file of filesToAdd) {
      const typeValidation = validateFileType(file);
      if (!typeValidation.isValid) continue;

      const sizeValidation = validateFileSize(file, maxSizeMB);
      if (!sizeValidation.isValid) continue;

      newImages.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    if (single) {
      // Revoke previous blob URL to avoid memory leak
      if (images[0]?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(images[0].previewUrl);
      }
      onImagesChange(newImages.length > 0 ? [newImages[0]] : []);
    } else {
      onImagesChange([...images, ...newImages]);
    }

    // Reset so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isMaxReached) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear when leaving the drop zone itself, not its children
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isMaxReached) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const remainingSlots = single ? 1 : maxImages - images.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);

    const newImages: ImageFile[] = filesToAdd.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (single) {
      // Revoke previous blob URL to avoid memory leak
      if (images[0]?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(images[0].previewUrl);
      }
      onImagesChange([newImages[0]]);
    } else {
      onImagesChange([...images, ...newImages]);
    }
  };

  // ── Remove image ───────────────────────────────────────────────────────────
  const handleRemoveImage = (index: number) => {
    const img = images[index];
    if (img.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(img.previewUrl);
    onImagesChange(images.filter((_, i) => i !== index));
  };

  // ── Lightbox ───────────────────────────────────────────────────────────────
  const handleImageClick = (image: ImageFile) => {
    setSelectedPreview(image.previewUrl || image.url || null);
  };

  const closePreview = () => setSelectedPreview(null);

  const defaultHelpText = single
    ? `PNG, JPG, GIF up to ${maxSizeMB}MB. Recommended size: 1200x800px.`
    : `PNG, JPG, GIF up to ${maxSizeMB}MB each. Add clear images to help illustrate.`;

  return (
    <div
      className="bg-gray-50 rounded-lg p-6"
      style={{ colorScheme: 'light', backgroundColor: '#f9fafb' }}
    >
      {/* Header */}
      <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
        {label} {!single && `(Optional, Max ${maxImages})`}
      </h3>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        {single ? 'Image' : 'Images'}
      </label>

      {/* Drop Zone */}
      <div
        className={`mt-1 flex justify-center px-4 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6 border-2 rounded-md transition-colors duration-200 ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 bg-white'
        } ${disabled || isMaxReached ? 'opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          {/* Upload icon — clicking triggers file picker via ref */}
          <FiUploadCloud
            onClick={handleUploadClick}
            className={`mx-auto h-10 w-10 mb-2 transition-colors duration-200 ${
              isDragging ? 'text-blue-400' : 'text-gray-300'
            } ${disabled || isMaxReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          />

          <div className="flex items-center justify-center text-sm text-gray-600">
            {/* Label triggers file picker via htmlFor */}
            <label
              htmlFor={id}
              className={`relative font-medium text-[#3FA9F6] hover:text-blue-500 focus-within:outline-none ${
                disabled || isMaxReached
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <span>Upload {single ? 'file' : 'files'}</span>
              {/* Hidden input — triggered by label click OR ref.click() */}
              <input
                ref={fileInputRef}
                id={id}
                type="file"
                accept="image/*"
                multiple={!single}
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || isMaxReached}
              />
            </label>
            <p className="pl-1 text-gray-500">or drag and drop</p>
          </div>

          <p className="text-xs text-gray-500">{helpText || defaultHelpText}</p>

          {isDragging && (
            <p className="text-sm font-semibold text-blue-500 animate-pulse">
              Drop to upload
            </p>
          )}
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div
          className={`mt-4 grid gap-2 ${
            single ? 'grid-cols-1' : 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4'
          }`}
        >
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.previewUrl || image.url}
                alt={`Preview ${index + 1}`}
                onClick={() => handleImageClick(image)}
                className={`${
                  single ? 'h-48 w-full' : 'h-24 w-full sm:h-28'
                } object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity`}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1 transition-colors"
                aria-label="Remove image"
              >
                <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox — clicking backdrop closes it */}
      {selectedPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closePreview}
        >
          {/* Stop propagation so clicking the image itself doesn't close */}
          <div
            className="relative"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedPreview}
              alt="Full preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg object-contain"
            />
            <button
              type="button"
              onClick={closePreview}
              className="absolute -top-3 -right-3 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-1.5 shadow-lg transition-colors"
              aria-label="Close preview"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};