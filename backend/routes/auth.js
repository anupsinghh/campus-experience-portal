const express = require('express');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, role, branch, graduationYear, isAlumni } = req.body;

    // Validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, username, email, and password',
      });
    }

    // Validate username format
    if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Username can only contain lowercase letters, numbers, and underscores',
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Username must be between 3 and 20 characters',
      });
    }

    // Check if email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Check if username exists
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        error: 'This username is already taken',
      });
    }

    // Create user
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email,
      password,
      role: role || (isAlumni ? 'alumni' : 'student'),
      branch,
      graduationYear,
      isAlumni: isAlumni || false,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        branch: user.branch,
        graduationYear: user.graduationYear,
        isAlumni: user.isAlumni,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during registration',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email/username and password',
      });
    }

    // Check for user by email or username and include password for comparison
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
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
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during login',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
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
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
});

module.exports = router;

