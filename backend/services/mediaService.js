const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { ServiceError } = require('./serviceError');

const uploadBuffer = (buffer, options, file) => {
  const isDummyCloudinary = 
    !process.env.CLOUDINARY_CLOUD_NAME || 
    process.env.CLOUDINARY_CLOUD_NAME.includes('your_cloudinary');

  return new Promise((resolve, reject) => {
    // If using placeholder/dummy configuration, immediately fallback to local Base64 mock
    if (isDummyCloudinary) {
      const mime = (file && file.mimetype) || 'image/png';
      const base64Data = buffer.toString('base64');
      return resolve({
        public_id: `mock_dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        secure_url: `data:${mime};base64,${base64Data}`
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.warn('⚠️ Cloudinary upload stream error, falling back to local Base64:', error.message || error);
        const mime = (file && file.mimetype) || 'image/png';
        const base64Data = buffer.toString('base64');
        return resolve({
          public_id: `mock_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          secure_url: `data:${mime};base64,${base64Data}`
        });
      }
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const validateFile = (file, { allowedMimeTypes, maxSizeBytes, requireImage }) => {
  if (!file) {
    throw new ServiceError('File upload missing', 400);
  }

  if (requireImage && !file.mimetype.startsWith('image/')) {
    throw new ServiceError('Only image files are allowed', 400);
  }

  if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
    throw new ServiceError(`File type not allowed: ${file.mimetype}`, 400);
  }

  if (maxSizeBytes && file.size > maxSizeBytes) {
    throw new ServiceError(`Image size should be less than ${Math.round(maxSizeBytes / (1024 * 1024))}MB`, 400);
  }
};

const uploadImages = async (files, { folder, allowedFormats, maxSizeBytes = 5 * 1024 * 1024 } = {}) => {
  if (!files || files.length === 0) return [];

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  const uploads = files.map(async (file) => {
    validateFile(file, { allowedMimeTypes, maxSizeBytes, requireImage: true });

    const result = await uploadBuffer(file.buffer, {
      folder,
      resource_type: 'auto',
      allowed_formats: allowedFormats
    }, file);

    return { public_id: result.public_id, url: result.secure_url };
  });

  return Promise.all(uploads);
};

const uploadSingleImage = async (file, { folder, allowedFormats, maxSizeBytes = 5 * 1024 * 1024 } = {}) => {
  if (!file) return undefined;

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  validateFile(file, { allowedMimeTypes, maxSizeBytes, requireImage: true });

  const result = await uploadBuffer(file.buffer, {
    folder,
    resource_type: 'auto',
    allowed_formats: allowedFormats
  }, file);

  return { public_id: result.public_id, url: result.secure_url };
};

const uploadAttachments = async (files, { folder, allowedMimeTypes, maxSizeBytes = 5 * 1024 * 1024 } = {}) => {
  if (!files || files.length === 0) return [];

  const uploads = files.map(async (file) => {
    validateFile(file, { allowedMimeTypes, maxSizeBytes, requireImage: false });

    const result = await uploadBuffer(file.buffer, {
      folder,
      resource_type: 'auto'
    }, file);

    return {
      type: file.mimetype.startsWith('image/') ? 'image' : 'file',
      url: result.secure_url,
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    };
  });

  return Promise.all(uploads);
};

const deleteByPublicId = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw error;
  }
};

const deleteImages = async (images) => {
  if (!images || !Array.isArray(images)) return;

  const deletions = images.map(async (image) => {
    if (!image || !image.public_id) return;
    try {
      await cloudinary.uploader.destroy(image.public_id);
    } catch (error) {
      return error;
    }
  });

  await Promise.all(deletions);
};

const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
      const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
      const withoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
      return withoutVersion.replace(/\.[^/.]+$/, '');
    }
  } catch (error) {
    return null;
  }
  return null;
};

const deleteByUrl = async (url) => {
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) return;
  await deleteByPublicId(publicId);
};

module.exports = {
  uploadImages,
  uploadSingleImage,
  uploadAttachments,
  deleteImages,
  deleteByPublicId,
  deleteByUrl,
  extractPublicIdFromUrl
};
