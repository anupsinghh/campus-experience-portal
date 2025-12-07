const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    experience: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Experience',
        required: [true, 'Experience reference is required'],
        index: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required'],
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [1000, 'Comment must be less than 1000 characters'],
    },
}, {
    timestamps: true,
});

// Index for efficient querying
commentSchema.index({ experience: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
