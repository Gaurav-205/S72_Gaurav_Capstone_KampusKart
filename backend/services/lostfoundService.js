const lostfoundRepository = require('../repositories/lostfoundRepository');
const { ServiceError } = require('./serviceError');
const mediaService = require('./mediaService');
const { escapeRegex, parsePagination } = require('./queryUtils');

const createItem = async ({ userId, data, files }) => {
  const { type, title, description, location, date, contact } = data;

  if (!title || !description || !date || !contact) {
    throw new ServiceError('Please provide title, description, date, and contact information.', 400);
  }

  const images = files && files.length > 0
    ? await mediaService.uploadImages(files, {
        folder: 'lost-found',
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      })
    : [];

  const item = await lostfoundRepository.create({
    user: userId,
    type,
    title,
    description,
    location,
    date,
    images,
    contact
  });

  await item.populate('user', 'name email');
  return item;
};

const getSuggestions = async ({ query }) => {
  if (!query) return [];

  const searchRegex = new RegExp(escapeRegex(query), 'i');

  const suggestions = await lostfoundRepository
    .find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex }
      ],
      isDeleted: { $ne: true }
    })
    .select('title description type resolved location date createdAt user')
    .limit(5)
    .sort({ createdAt: -1 })
    .populate('user', 'name');

  return suggestions.map((item) => ({
    _id: item._id,
    title: item.title,
    description: item.description,
    type: item.type,
    resolved: item.resolved,
    location: item.location,
    date: item.date,
    createdAt: item.createdAt,
    userName: item.user?.name || '',
    displayText: `${item.title} (${item.type}${item.resolved ? ' - Resolved' : ''})`,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    timeAgo: getTimeAgo(new Date(item.createdAt))
  }));
};

const listItems = async ({ type, category, resolved, search, page, limit }) => {
  const filter = { isDeleted: { $ne: true } };
  const itemType = type || category;

  if (itemType && itemType !== 'all' && itemType !== 'All') {
    filter.type = itemType;
  }
  if (resolved !== undefined) {
    filter.resolved = resolved === 'true' || resolved === true;
  }
  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { location: searchRegex }
    ];
  }

  const { page: parsedPage, limit: parsedLimit, skip } = parsePagination({
    page,
    limit,
    defaultLimit: 10,
    maxLimit: 100
  });

  const totalItems = await lostfoundRepository.count(filter);
  const totalPages = Math.ceil(totalItems / parsedLimit);

  const items = await lostfoundRepository
    .find(filter)
    .skip(skip)
    .limit(parsedLimit)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  return { items, totalItems, totalPages, page: parsedPage };
};

const listAdminItems = async ({ type, resolved, search, page, limit, includeDeleted }) => {
  const query = {};

  if (type && type !== 'All') {
    query.type = type;
  }
  if (resolved !== undefined) {
    query.resolved = resolved === 'true' || resolved === true;
  }
  if (search) {
    const escapedSearch = escapeRegex(search);
    query.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
      { location: { $regex: escapedSearch, $options: 'i' } }
    ];
  }
  if (includeDeleted !== 'true') {
    query.isDeleted = { $ne: true };
  }

  const { page: parsedPage, limit: parsedLimit, skip } = parsePagination({
    page,
    limit,
    defaultLimit: 50,
    maxLimit: 100
  });

  const totalItems = await lostfoundRepository.count(query);
  const totalPages = Math.ceil(totalItems / parsedLimit);

  const items = await lostfoundRepository
    .find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  return { items, totalItems, totalPages, page: parsedPage };
};

const getItemById = async (id) => {
  const item = await lostfoundRepository
    .findOne({ _id: id, isDeleted: { $ne: true } })
    .populate('user', 'name email');

  if (!item) {
    throw new ServiceError('Item not found', 404);
  }

  return item;
};

const updateItem = async ({ itemId, userId, isAdmin, data, files }) => {
  const { type, title, description, location, date, resolved, contact, keepImages } = data;

  if (!title || !description || !date || !contact) {
    throw new ServiceError('Please provide title, description, date, and contact information.', 400);
  }

  const item = await lostfoundRepository.findById(itemId);
  if (!item || item.isDeleted) {
    throw new ServiceError('Item not found', 404);
  }

  if (item.resolved) {
    throw new ServiceError('Resolved items cannot be updated', 409);
  }

  if (item.user.toString() !== userId.toString() && !isAdmin) {
    throw new ServiceError('You are not authorized to update this item', 403);
  }

  let keepPublicIds = [];
  if (keepImages) {
    try {
      keepPublicIds = JSON.parse(keepImages);
    } catch (error) {
      keepPublicIds = [];
    }
  }

  if (Array.isArray(item.images)) {
    for (const img of item.images) {
      if (!keepPublicIds.includes(img.public_id)) {
        try {
          await mediaService.deleteByPublicId(img.public_id);
        } catch (error) {
          // Ignore delete errors
        }
      }
    }
  }

  let keptImages = [];
  if (Array.isArray(item.images)) {
    keptImages = keepPublicIds
      .map((pid) => item.images.find((img) => img.public_id === pid))
      .filter(Boolean);
  }

  if (files && files.length > 0) {
    const newImages = await mediaService.uploadImages(files, {
      folder: 'lost-found',
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    });
    keptImages = [...keptImages, ...newImages];
  }

  item.type = type || item.type;
  item.title = title || item.title;
  item.description = description || item.description;
  item.location = location || item.location;
  item.date = date || item.date;
  item.contact = contact || item.contact;
  item.images = keptImages;

  if (resolved !== undefined) {
    item.resolved = resolved;
  }

  await item.save();
  await item.populate('user', 'name email');
  return item;
};

const deleteItem = async ({ itemId, userId, isAdmin }) => {
  const item = await lostfoundRepository.findById(itemId);
  if (!item) {
    throw new ServiceError('Item not found', 404);
  }

  if (item.user.toString() !== userId.toString() && !isAdmin) {
    throw new ServiceError('You are not authorized to delete this item', 403);
  }

  item.isDeleted = true;
  item.deletedAt = new Date();
  await item.save();

  return { message: 'Item soft-deleted successfully' };
};

const resolveItem = async ({ itemId, userId, isAdmin }) => {
  const item = await lostfoundRepository.findById(itemId);
  if (!item) {
    throw new ServiceError('Item not found', 404);
  }

  if (item.user.toString() !== userId.toString() && !isAdmin) {
    throw new ServiceError('You are not authorized to mark this item as resolved', 403);
  }

  item.resolved = true;
  item.resolvedAt = new Date();
  await item.save();

  return { message: 'Item marked as resolved' };
};

const adminRestoreItem = async (itemId) => {
  const item = await lostfoundRepository.findById(itemId);
  if (!item) {
    throw new ServiceError('Item not found', 404);
  }

  item.isDeleted = false;
  item.deletedAt = undefined;
  await item.save();

  await item.populate('user', 'name email');
  return { message: 'Item restored successfully.', item };
};

const adminPermanentDelete = async (itemId) => {
  const item = await lostfoundRepository.findById(itemId);
  if (!item) {
    throw new ServiceError('Item not found', 404);
  }

  await mediaService.deleteImages(item.images);
  await lostfoundRepository.deleteOne({ _id: itemId });
  return { message: 'Item permanently deleted successfully' };
};

const adminCleanupExpired = async () => {
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);

  const expiredItems = await lostfoundRepository.find({
    resolved: true,
    resolvedAt: { $lt: fourteenDaysAgo },
    isDeleted: { $ne: true }
  });

  let deletedCount = 0;
  let errorCount = 0;

  for (const item of expiredItems) {
    try {
      await mediaService.deleteImages(item.images);
      item.isDeleted = true;
      item.deletedAt = new Date();
      await item.save();
      deletedCount += 1;
    } catch (error) {
      errorCount += 1;
    }
  }

  return {
    message: 'Manual cleanup completed',
    deletedCount,
    errorCount,
    totalFound: expiredItems.length
  };
};

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000;
  if (interval >= 1) {
    const n = Math.floor(interval);
    return n + (n === 1 ? ' year ago' : ' years ago');
  }

  interval = seconds / 2592000;
  if (interval >= 1) {
    const n = Math.floor(interval);
    return n + (n === 1 ? ' month ago' : ' months ago');
  }

  interval = seconds / 86400;
  if (interval >= 1) {
    const n = Math.floor(interval);
    return n + (n === 1 ? ' day ago' : ' days ago');
  }

  interval = seconds / 3600;
  if (interval >= 1) {
    const n = Math.floor(interval);
    return n + (n === 1 ? ' hour ago' : ' hours ago');
  }

  interval = seconds / 60;
  if (interval >= 1) {
    const n = Math.floor(interval);
    return n + (n === 1 ? ' minute ago' : ' minutes ago');
  }

  return Math.floor(seconds) + ' seconds ago';
};

module.exports = {
  createItem,
  getSuggestions,
  listItems,
  listAdminItems,
  getItemById,
  updateItem,
  deleteItem,
  resolveItem,
  adminRestoreItem,
  adminPermanentDelete,
  adminCleanupExpired
};
