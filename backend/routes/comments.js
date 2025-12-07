const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :experienceId
const Comment = require('../models/Comment');
const Experience = require('../models/Experience');
const { protect } = require('../middleware/auth');

// GET /api/experiences/:experienceId/comments - Get all comments for an experience
router.get('/', async (req, res) => {
    try {
        const { experienceId } = req.params;

        // Verify experience exists
        const experience = await Experience.findById(experienceId);
        if (!experience) {
            return res.status(404).json({ error: 'Experience not found' });
        }

        const comments = await Comment.find({ experience: experienceId })
            .populate('author', 'name username email role')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/experiences/:experienceId/comments - Create a comment (Protected)
router.post('/', protect, async (req, res) => {
    try {
        const { experienceId } = req.params;
        const { content } = req.body;

        // Validate content
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Verify experience exists
        const experience = await Experience.findById(experienceId);
        if (!experience) {
            return res.status(404).json({ error: 'Experience not found' });
        }

        const comment = await Comment.create({
            experience: experienceId,
            author: req.user._id,
            content: content.trim(),
        });

        // Populate author info before returning
        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name username email role');

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/comments/:id - Delete a comment (Protected - only author or admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user is author or admin
        if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(req.params.id);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
