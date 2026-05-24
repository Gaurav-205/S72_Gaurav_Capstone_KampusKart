const chatRepository = require('../repositories/chatRepository');
const { ServiceError } = require('./serviceError');
const mediaService = require('./mediaService');
const { parsePagination } = require('./queryUtils');

const ALLOWED_CHAT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const listMessages = async ({ page, limit }) => {
  const { page: parsedPage, limit: parsedLimit, skip } = parsePagination({
    page,
    limit,
    defaultLimit: 50,
    maxLimit: 100
  });

  const messages = await chatRepository
    .find({ isDeleted: false })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .populate('sender', 'name profilePicture')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'name' }
    })
    .lean();

  const total = await chatRepository.count({ isDeleted: false });

  return {
    messages: messages.reverse(),
    pagination: {
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

const searchMessages = async ({ query }) => {
  if (!query || !query.trim()) {
    throw new ServiceError('Search query is required', 400);
  }

  const messages = await chatRepository
    .find({ $text: { $search: query }, isDeleted: false }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .populate('sender', 'name profilePicture')
    .limit(20)
    .lean();

  return messages;
};

const sendMessage = async ({ userId, message, replyTo, files }) => {
  const attachments = files && files.length > 0
    ? await mediaService.uploadAttachments(files, {
        folder: 'chat_attachments',
        allowedMimeTypes: ALLOWED_CHAT_MIME_TYPES
      })
    : [];

  if (!message?.trim() && attachments.length === 0) {
    throw new ServiceError('Message cannot be empty', 400);
  }

  if (message && message.length > 2000) {
    throw new ServiceError('Message cannot exceed 2000 characters', 400);
  }

  const chatMessage = await chatRepository.create({
    sender: userId,
    message: message || (attachments.length > 0 ? '📎 Attachment' : ''),
    attachments,
    replyTo
  });

  const populatedMessage = await chatRepository
    .findById(chatMessage._id)
    .populate('sender', 'name profilePicture')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'name' }
    })
    .lean();

  return populatedMessage;
};

const editMessage = async ({ messageId, userId, message }) => {
  const chatMessage = await chatRepository.findById(messageId);
  if (!chatMessage) {
    throw new ServiceError('Message not found', 404);
  }

  if (chatMessage.sender.toString() !== userId.toString()) {
    throw new ServiceError('Not authorized to edit this message', 403);
  }

  if (!message || !message.trim()) {
    throw new ServiceError('Message cannot be empty', 400);
  }

  if (message.length > 2000) {
    throw new ServiceError('Message cannot exceed 2000 characters', 400);
  }

  chatMessage.message = message;
  chatMessage.edited = true;
  chatMessage.editedAt = new Date();
  await chatMessage.save();

  const updatedMessage = await chatRepository
    .findById(chatMessage._id)
    .populate('sender', 'name profilePicture')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'name' }
    })
    .lean();

  return updatedMessage;
};

const deleteMessage = async ({ messageId, userId, isAdmin, permanent = false }) => {
  const message = await chatRepository.findById(messageId);
  if (!message) {
    throw new ServiceError('Message not found', 404);
  }

  if (permanent && !isAdmin) {
    throw new ServiceError('Only admins can permanently delete messages', 403);
  }

  if (!permanent && message.sender.toString() !== userId.toString() && !isAdmin) {
    throw new ServiceError('Not authorized to delete this message', 403);
  }

  if (message.attachments && message.attachments.length > 0) {
    for (const attachment of message.attachments) {
      try {
        await mediaService.deleteByUrl(attachment.url);
      } catch (error) {
        // Ignore delete errors
      }
    }
  }

  if (permanent) {
    await chatRepository.deleteById(messageId);
    return { message: 'Message permanently deleted successfully' };
  }

  message.isDeleted = true;
  await message.save();
  return { message: 'Message deleted successfully' };
};

const addReaction = async ({ messageId, userId, emoji }) => {
  const message = await chatRepository.findById(messageId);
  if (!message) {
    throw new ServiceError('Message not found', 404);
  }

  await message.addReaction(userId, emoji);

  const updatedMessage = await chatRepository
    .findById(message._id)
    .populate('sender', 'name profilePicture')
    .populate('reactions.user', 'name profilePicture')
    .lean();

  return updatedMessage;
};

const markRead = async ({ messageId, userId }) => {
  const message = await chatRepository.findById(messageId);
  if (!message) {
    throw new ServiceError('Message not found', 404);
  }

  await message.markAsRead(userId);

  const updatedMessage = await chatRepository
    .findById(message._id)
    .populate('sender', 'name profilePicture')
    .populate('readBy.user', 'name profilePicture')
    .lean();

  return updatedMessage;
};

const cleanupOrphanedAttachments = async () => {
  const deletedMessages = await chatRepository.findDeletedWithAttachments();

  let deletedCount = 0;
  let errorCount = 0;

  for (const message of deletedMessages) {
    if (message.attachments && message.attachments.length > 0) {
      for (const attachment of message.attachments) {
        try {
          await mediaService.deleteByUrl(attachment.url);
          deletedCount += 1;
        } catch (error) {
          errorCount += 1;
        }
      }
    }
  }

  return {
    message: 'Cleanup completed',
    deletedCount,
    errorCount,
    totalProcessed: deletedMessages.length
  };
};

module.exports = {
  listMessages,
  searchMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  markRead,
  cleanupOrphanedAttachments
};
