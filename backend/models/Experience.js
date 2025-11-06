const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
  },
  roundName: {
    type: String,
    required: true,
    trim: true,
  },
  questions: [{
    type: String,
    trim: true,
  }],
  feedback: {
    type: String,
    trim: true,
  },
});

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true,
  },
  role: {
    type: String,
    required: [true, 'Job role is required'],
    trim: true,
    index: true,
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true,
    index: true,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    index: true,
  },
  rounds: {
    type: [roundSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one interview round is required',
    },
  },
  package: {
    type: String,
    trim: true,
  },
  tips: {
    type: String,
    trim: true,
  },
  interviewDate: {
    type: Date,
  },
  offerStatus: {
    type: String,
    enum: ['Selected', 'Not Selected', 'Pending'],
    default: 'Pending',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow anonymous submissions
    index: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  helpful: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
experienceSchema.index({ company: 1, role: 1 });
experienceSchema.index({ branch: 1, year: 1 });
experienceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Experience', experienceSchema);

