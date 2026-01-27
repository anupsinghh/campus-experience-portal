const express = require('express');
const router = express.Router({ mergeParams: true });
const Comment = require('../models/Comment');
const Experience = require('../models/Experience');
const Notification = require('../models/Notification');
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
            parentComment: null,
        });

        const authorId = experience.author ? experience.author.toString() : null;
        const commenterId = req.user._id.toString();
        if (authorId && authorId !== commenterId) {
            await Notification.create({
                user: experience.author,
                type: 'comment',
                experience: experienceId,
                comment: comment._id,
                read: false,
            });
        }

        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name username email role');

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/experiences/:experienceId/comments/:commentId/replies - Reply as "Posted By" (experience author)
router.post('/:commentId/replies', protect, async (req, res) => {
    try {
        const { experienceId, commentId } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Reply content is required' });
        }

        const experience = await Experience.findById(experienceId);
        if (!experience) {
            return res.status(404).json({ error: 'Experience not found' });
        }

        if (!experience.author) {
            return res.status(403).json({ error: 'This experience has no linked author; replies are not allowed.' });
        }

        if (experience.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the person who posted this experience (Posted By) can reply.' });
        }

        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (parentComment.experience.toString() !== experienceId) {
            return res.status(400).json({ error: 'Comment does not belong to this experience.' });
        }
        if (parentComment.parentComment) {
            return res.status(400).json({ error: 'Cannot reply to a reply.' });
        }

        const reply = await Comment.create({
            experience: experienceId,
            author: req.user._id,
            content: content.trim(),
            parentComment: commentId,
        });

        const populatedReply = await Comment.findById(reply._id)
            .populate('author', 'name username email role');

        res.status(201).json(populatedReply);
    } catch (error) {
        console.error('Error creating reply:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/comments/:id - Delete a comment and its replies (Protected - only author or admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const isAuthor = comment.author.toString() === req.user._id.toString();
        const isStaff = ['admin', 'coordinator', 'teacher'].includes(req.user.role);
        if (!isAuthor && !isStaff) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        await Comment.deleteMany({ parentComment: req.params.id });
        await Comment.findByIdAndDelete(req.params.id);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
