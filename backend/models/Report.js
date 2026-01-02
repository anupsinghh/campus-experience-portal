const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  experience: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experience',
    required: true,
    index: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow anonymous reports
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'inappropriate', 'false_information', 'duplicate', 'other'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must be less than 500 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
    index: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  adminNotes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ experience: 1, status: 1 });

module.exports = mongoose.model('Report', reportSchema);

