const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [2000, 'Content must be less than 2000 characters'],
  },
  type: {
    type: String,
    enum: ['placement', 'general', 'important'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
announcementSchema.index({ isActive: 1, publishedAt: -1 });
announcementSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);

