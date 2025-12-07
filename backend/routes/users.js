const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Experience = require('../models/Experience');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        branch: user.branch,
        graduationYear: user.graduationYear,
        isAlumni: user.isAlumni,
        currentCompany: user.currentCompany,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, branch, graduationYear, currentCompany, isAlumni, profile } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        branch,
        graduationYear,
        currentCompany,
        isAlumni,
        profile,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        branch: user.branch,
        graduationYear: user.graduationYear,
        isAlumni: user.isAlumni,
        currentCompany: user.currentCompany,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
});

// @route   GET /api/users/:username
// @desc    Get public user profile by username
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get user's public experiences
    const experiences = await Experience.find({ author: user._id })
      .select('company role branch year offerStatus package createdAt views')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        branch: user.branch,
        graduationYear: user.graduationYear,
        isAlumni: user.isAlumni,
        currentCompany: user.currentCompany,
        profile: user.profile,
      },
      experiences,
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
});

module.exports = router;
