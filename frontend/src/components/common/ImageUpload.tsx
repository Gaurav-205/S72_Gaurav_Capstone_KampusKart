import React, { useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { validateFileSize, validateFileType } from '../../utils/formValidation';

export interface ImageFile {
  file?: File;
  previewUrl?: string;
  url?: string;
  public_id?: string;
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange?: (images: ImageFile[]) => void;
  setImages?: (images: ImageFile[]) => void;
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
 * Supports single or multiple image uploads with preview and drag-and-drop
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  setImages,
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

  const triggerImagesChange = (newImages: ImageFile[]) => {
    if (typeof onImagesChange === 'function') {
      onImagesChange(newImages);
    } else if (typeof setImages === 'function') {
      setImages(newImages);
    }
  };

  const processFiles = (filesArray: File[]) => {
    const remainingSlots = single ? (images.length === 0 ? 1 : 0) : maxImages - images.length;
    const filesToAdd = filesArray.slice(0, remainingSlots);

    const newImages: ImageFile[] = [];

    for (const file of filesToAdd) {
      // Validate file type
      const typeValidation = validateFileType(file);
      if (!typeValidation.isValid) {
        // Could show error toast here
        continue;
      }

      // Validate file size
      const sizeValidation = validateFileSize(file, maxSizeMB);
      if (!sizeValidation.isValid) {
        // Could show error toast here
        continue;
      }

      newImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (newImages.length === 0) return;

    if (single) {
      triggerImagesChange(newImages.length > 0 ? [newImages[0]] : []);
    } else {
      triggerImagesChange([...images, ...newImages]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled) return;
    processFiles(Array.from(e.target.files));
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    triggerImagesChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isMaxReached) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isMaxReached || !e.dataTransfer.files) return;

    const filesArray = Array.from(e.dataTransfer.files);
    processFiles(filesArray);
  };

  const isMaxReached = single ? images.length >= 1 : images.length >= maxImages;

  const defaultHelpText = single
    ? `PNG, JPG, GIF up to ${maxSizeMB}MB. Recommended size: 1200x800px.`
    : `PNG, JPG, GIF up to ${maxSizeMB}MB each. Add clear images to help illustrate.`;

  return (
    <div className="bg-gray-50 rounded-lg p-6" style={{ colorScheme: 'light', backgroundColor: '#f9fafb' }}>
      <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
        {label} {!single && `(Optional, Max ${maxImages})`}
      </h3>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {single ? 'Image' : 'Images'}
      </label>
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-1 flex justify-center px-4 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6 border-2 border-dashed rounded-md transition-all duration-200 ${
          isDragging
            ? 'border-[#3FA9F6] bg-blue-50/50 scale-[1.02] shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className="space-y-1 text-center">
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor={id}
              className={`relative cursor-pointer bg-white rounded-md font-medium text-[#3FA9F6] hover:text-blue-500 focus-within:outline-none ${
                disabled || isMaxReached ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>Upload {single ? 'file' : 'files'}</span>
              <input
                ref={fileInputRef}
                id={id}
                type="file"
                accept="image/*"
                multiple={!single}
                className="sr-only"
                onChange={handleFileChange}
                disabled={disabled || isMaxReached}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">{helpText || defaultHelpText}</p>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className={`mt-4 grid gap-2 ${single ? 'grid-cols-1' : 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4'}`}>
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.previewUrl || image.url}
                alt={`Preview ${index + 1}`}
                className={`${single ? 'h-48 w-full' : 'h-24 w-full sm:h-28'} object-cover rounded-lg border-2 border-gray-200`}
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
    </div>
  );
};

