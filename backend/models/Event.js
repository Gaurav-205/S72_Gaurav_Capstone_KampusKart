const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Registered', 'Approved', 'Rejected'],
      default: 'Registered',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming',
  },
  image: {
    public_id: { type: String },
    url: { type: String },
  },

  // OLD external form link support (kept for backward compatibility)
  registerUrl: { type: String },

  // ERP Registration System
  registrationEnabled: {
    type: Boolean,
    default: true,
  },
  registrationDeadline: {
    type: Date,
  },
  participantLimit: {
    type: Number,
    default: null,
  },
  registrations: [registrationSchema],

  operatingHours: { type: String },

  contactInfo: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },

  mapLocation: {
    building: { type: String },
    floor: { type: String },
    room: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for frequently queried fields
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ date: 1, status: 1 });

// Registration indexes
eventSchema.index({ 'registrations.user': 1 });
eventSchema.index({ registrationDeadline: 1 });

module.exports = mongoose.model('Event', eventSchema);
