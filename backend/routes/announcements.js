const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// GET /api/announcements - Get active announcements (public)
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    })
      .populate('publishedBy', 'name username')
      .sort({ publishedAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

