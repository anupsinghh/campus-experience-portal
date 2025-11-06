const express = require('express');
const router = express.Router();
const User = require('../models/User');
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
    const { name, branch, graduationYear, currentCompany, profile } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        branch,
        graduationYear,
        currentCompany,
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

module.exports = router;

