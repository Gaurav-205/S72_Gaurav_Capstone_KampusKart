const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const readReceiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: function () {
        // Message is required only if there are no attachments
        return !this.attachments || this.attachments.length === 0;
      },
      trim: true,
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'file'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        name: String,
        size: Number,
        mimeType: String,
      },
    ],
    reactions: [reactionSchema],
    readBy: [readReceiptSchema],
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for faster queries
chatSchema.index({ createdAt: -1 });
chatSchema.index({ isDeleted: 1, createdAt: -1 });
chatSchema.index({ message: 'text' });
chatSchema.index({ 'readBy.user': 1 });
chatSchema.index({ 'reactions.user': 1 });

// Add method to check if user has read the message
chatSchema.methods.isReadBy = function (userId) {
  return this.readBy.some((receipt) => receipt.user.toString() === userId.toString());
};

// Add method to add reaction
chatSchema.methods.addReaction = async function (userId, emoji) {
  const existingReaction = this.reactions.find(
    (r) => r.user.toString() === userId.toString() && r.emoji === emoji
  );

  if (existingReaction) {
    this.reactions = this.reactions.filter(
      (r) => !(r.user.toString() === userId.toString() && r.emoji === emoji)
    );
  } else {
    this.reactions.push({ user: userId, emoji });
  }

  return this.save();
};

// Add method to mark as read
chatSchema.methods.markAsRead = async function (userId) {
  if (!this.isReadBy(userId)) {
    this.readBy.push({ user: userId });
    return this.save();
  }
  return this;
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
