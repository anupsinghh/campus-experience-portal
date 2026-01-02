const mongoose = require('mongoose');

const companyStandardizationSchema = new mongoose.Schema({
  standardName: {
    type: String,
    required: [true, 'Standard company name is required'],
    trim: true,
    unique: true,
    index: true,
  },
  variations: [{
    type: String,
    trim: true,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for faster lookups
companyStandardizationSchema.index({ standardName: 1 });

module.exports = mongoose.model('CompanyStandardization', companyStandardizationSchema);

