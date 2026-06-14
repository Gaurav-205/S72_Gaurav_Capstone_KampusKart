const chatService = require('../services/chatService');
const { handleServiceError } = require('./controllerUtils');

const listMessages = async (req, res) => {
  try {
    const result = await chatService.listMessages(req.query);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error fetching messages');
  }
};

const searchMessages = async (req, res) => {
  try {
    const messages = await chatService.searchMessages({ query: req.query.query });
    res.json(messages);
  } catch (error) {
    handleServiceError(res, error, 'Error searching messages');
  }
};

const sendMessage = async (req, res) => {
  try {
    const message = await chatService.sendMessage({
      userId: req.user._id,
      message: req.body.message,
      replyTo: req.body.replyTo,
      files: req.files
    });

    const io = req.app.get('io');
    if (io) {
      io.to('global-chat').emit('new-message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    handleServiceError(res, error, 'Error sending message');
  }
};

const editMessage = async (req, res) => {
  try {
    const message = await chatService.editMessage({
      messageId: req.params.messageId,
      userId: req.user._id,
      message: req.body.message
    });
    res.json(message);
  } catch (error) {
    handleServiceError(res, error, 'Error editing message');
  }
};

const deleteMessage = async (req, res) => {
  try {
    const result = await chatService.deleteMessage({
      messageId: req.params.messageId,
      userId: req.user._id,
      isAdmin: req.user.isAdmin,
      permanent: false
    });

    const io = req.app.get('io');
    if (io) {
      io.to('global-chat').emit('message-deleted', { _id: req.params.messageId });
    }

    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error deleting message');
  }
};

const deleteMessagePermanent = async (req, res) => {
  try {
    const result = await chatService.deleteMessage({
      messageId: req.params.messageId,
      userId: req.user._id,
      isAdmin: req.user.isAdmin,
      permanent: true
    });

    const io = req.app.get('io');
    if (io) {
      io.to('global-chat').emit('message-deleted', { _id: req.params.messageId });
    }

    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error permanently deleting message');
  }
};

const addReaction = async (req, res) => {
  try {
    const message = await chatService.addReaction({
      messageId: req.params.messageId,
      userId: req.user._id,
      emoji: req.body.emoji
    });
    res.json(message);
  } catch (error) {
    handleServiceError(res, error, 'Error updating reaction');
  }
};

const markRead = async (req, res) => {
  try {
    const message = await chatService.markRead({
      messageId: req.params.messageId,
      userId: req.user._id
    });
    res.json(message);
  } catch (error) {
    handleServiceError(res, error, 'Error marking message as read');
  }
};

const cleanupOrphanedAttachments = async (req, res) => {
  try {
    const result = await chatService.cleanupOrphanedAttachments();
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, 'Error during cleanup');
  }
};

module.exports = {
  listMessages,
  searchMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  deleteMessagePermanent,
  addReaction,
  markRead,
  cleanupOrphanedAttachments
};
