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
    // Debug: Log the request body
    console.log('Register request body:', { ...req.body, password: req.body.password ? '***' : 'missing' });
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { name, username, email, password, role, branch, graduationYear, isAlumni } = req.body;

    // Validation - ensure all required fields are present and not empty
    if (!name || !username || !email || !password) {
      console.log('Validation failed - missing required fields:', { 
        hasName: !!name, 
        hasUsername: !!username, 
        hasEmail: !!email, 
        hasPassword: !!password 
      });
      return res.status(400).json({
        success: false,
        error: 'Please provide name, username, email, and password',
      });
    }

    // Ensure username is a non-empty string after trimming
    const trimmedUsername = String(username).trim();
    if (!trimmedUsername || trimmedUsername === '') {
      console.log('Validation failed - username is empty after trimming');
      return res.status(400).json({
        success: false,
        error: 'Username cannot be empty',
      });
    }

    // Validate username format
    if (!/^[a-z0-9_]+$/.test(trimmedUsername.toLowerCase())) {
      console.log('Validation failed - username format invalid:', trimmedUsername);
      return res.status(400).json({
        success: false,
        error: 'Username can only contain lowercase letters, numbers, and underscores',
      });
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      console.log('Validation failed - username length invalid:', trimmedUsername.length);
      return res.status(400).json({
        success: false,
        error: 'Username must be between 3 and 20 characters',
      });
    }

    // Validate email domain
    const emailRegex = /^[a-zA-Z0-9._-]+@marwadiuniversity\.(ac|edu)\.in$/;
    if (!emailRegex.test(email.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Email must be from @marwadiuniversity.ac.in or @marwadiuniversity.edu.in domain',
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
    const usernameExists = await User.findOne({ username: trimmedUsername.toLowerCase() });
    if (usernameExists) {
      console.log('Registration failed - username already exists:', trimmedUsername);
      return res.status(400).json({
        success: false,
        error: 'This username is already taken',
      });
    }

    // Create user - ensure username is never null
    console.log('Creating user with username:', trimmedUsername.toLowerCase());
    const allowedRoles = ['student', 'alumni'];
    const requestedRole = (role || (isAlumni ? 'alumni' : 'student')).toLowerCase();
    const finalRole = allowedRoles.includes(requestedRole) ? requestedRole : (isAlumni ? 'alumni' : 'student');

    const user = await User.create({
      name: String(name).trim(),
      username: trimmedUsername.toLowerCase(),
      email: String(email).trim().toLowerCase(),
      password,
      role: finalRole,
      branch: branch ? String(branch).trim() : undefined,
      graduationYear,
      isAlumni: isAlumni || false,
    });
    console.log('User created successfully:', user._id);

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
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      if (field === 'username') {
        return res.status(400).json({
          success: false,
          error: 'This username is already taken',
        });
      }
      if (field === 'email') {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email',
        });
      }
      return res.status(400).json({
        success: false,
        error: `${field} already exists`,
      });
    }
    
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
    // Debug: Log the request body
    console.log('Login request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Check if body is empty or not parsed
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Request body is empty or not parsed');
      return res.status(400).json({
        success: false,
        error: 'Please provide email/username and password',
      });
    }
    
    const { identifier, password } = req.body;

    // Validation - check for empty strings as well
    const trimmedIdentifier = typeof identifier === 'string' ? identifier.trim() : identifier;
    const trimmedPassword = typeof password === 'string' ? password.trim() : password;
    
    if (!trimmedIdentifier || !trimmedPassword || trimmedIdentifier === '' || trimmedPassword === '') {
      console.log('Validation failed - identifier:', trimmedIdentifier, 'password:', trimmedPassword ? '***' : 'missing');
      return res.status(400).json({
        success: false,
        error: 'Please provide email/username and password',
      });
    }

    // Hardcoded admin credentials check
    const ADMIN_EMAIL = 'admin@marwadiuniversity.ac.in';
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123'; // Hardcoded for now

    if ((trimmedIdentifier.toLowerCase() === ADMIN_EMAIL || trimmedIdentifier.toLowerCase() === ADMIN_USERNAME) && 
        trimmedPassword === ADMIN_PASSWORD) {
      // Check if admin user exists, if not create it
      let adminUser = await User.findOne({ 
        $or: [
          { email: ADMIN_EMAIL },
          { username: ADMIN_USERNAME }
        ]
      });

      if (!adminUser) {
        adminUser = await User.create({
          name: 'Admin',
          username: ADMIN_USERNAME,
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: 'admin',
        });
      } else if (adminUser.role !== 'admin') {
        // Update existing user to admin if needed
        adminUser.role = 'admin';
        await adminUser.save();
      }

      const token = generateToken(adminUser._id);
      return res.json({
        success: true,
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role,
          branch: adminUser.branch,
          graduationYear: adminUser.graduationYear,
          isAlumni: adminUser.isAlumni,
          currentCompany: adminUser.currentCompany,
        },
      });
    }

    // Check for user by email or username and include password for comparison
    const user = await User.findOne({
      $or: [
        { email: trimmedIdentifier.toLowerCase() },
        { username: trimmedIdentifier.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(trimmedPassword);

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

