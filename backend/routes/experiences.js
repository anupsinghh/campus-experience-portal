const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');

// GET /api/experiences/filters - Get unique filter options
router.get('/filters', async (req, res) => {
  try {
    const experiences = await Experience.find({}, 'company role branch year');
    
    const companies = [...new Set(experiences.map(exp => exp.company).filter(Boolean))].sort();
    const roles = [...new Set(experiences.map(exp => exp.role).filter(Boolean))].sort();
    const branches = [...new Set(experiences.map(exp => exp.branch).filter(Boolean))].sort();
    const years = [...new Set(experiences.map(exp => exp.year).filter(Boolean))].sort((a, b) => b - a);
    
    res.json({
      companies,
      roles,
      branches,
      years
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/experiences - Get all experiences with optional filters
router.get('/', async (req, res) => {
  try {
    const { company, role, branch, year, search } = req.query;

    // Build query
    const query = {};

    // Only show approved experiences to regular users
    // Admins can see all via admin routes
    query.moderationStatus = { $in: ['approved', null] }; // null for backward compatibility

    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    if (role) {
      query.role = { $regex: role, $options: 'i' };
    }

    if (branch) {
      query.branch = { $regex: branch, $options: 'i' };
    }

    if (year) {
      query.year = parseInt(year);
    }

    let experiences = await Experience.find(query)
      .populate('author', 'name username email role branch')
      .sort({ createdAt: -1 });

    // Search across multiple fields (client-side for now, can be optimized with MongoDB text search)
    if (search) {
      const searchLower = search.toLowerCase();
      experiences = experiences.filter(exp =>
        exp.company.toLowerCase().includes(searchLower) ||
        exp.role.toLowerCase().includes(searchLower) ||
        exp.branch.toLowerCase().includes(searchLower) ||
        (exp.tips && exp.tips.toLowerCase().includes(searchLower)) ||
        exp.rounds.some(round =>
          round.questions.some(q => q.toLowerCase().includes(searchLower)) ||
          (round.feedback && round.feedback.toLowerCase().includes(searchLower))
        )
      );
    }

    res.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/experiences/my - Get experiences by current user (Protected)
router.get('/my', protect, async (req, res) => {
  try {
    const experiences = await Experience.find({ author: req.user._id })
      .populate('author', 'name username email role branch')
      .sort({ createdAt: -1 });

    res.json(experiences);
  } catch (error) {
    console.error('Error fetching user experiences:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/experiences/:id - Get single experience
router.get('/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid experience ID format' });
    }

    const experience = await Experience.findById(req.params.id)
      .populate('author', 'name username email role branch graduationYear currentCompany');

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Increment views
    experience.views += 1;
    await experience.save();

    res.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// POST /api/experiences - Create new experience (Optional auth - works with or without)
router.post('/', async (req, res) => {
  try {
    const {
      company,
      role,
      branch,
      year,
      rounds,
      package: pkg,
      tips,
      interviewDate,
      offerStatus,
      author, // For anonymous submissions
    } = req.body;

    // Basic validation
    if (!company || !role || !branch || !year || !rounds) {
      return res.status(400).json({
        error: 'Missing required fields: company, role, branch, year, rounds'
      });
    }

    // Validate package (salary) is required
    if (!pkg || pkg.trim() === '') {
      return res.status(400).json({
        error: 'Package (Salary) is required'
      });
    }

    // Validate that all rounds have feedback
    if (!Array.isArray(rounds) || rounds.length === 0) {
      return res.status(400).json({
        error: 'At least one placement round is required'
      });
    }

    for (let i = 0; i < rounds.length; i++) {
      if (!rounds[i].feedback || rounds[i].feedback.trim() === '') {
        return res.status(400).json({
          error: `Feedback/Tips for Round ${i + 1} is required`
        });
      }
    }

    // If user is authenticated, use their info; otherwise use provided author name
    let authorId = null;
    let authorName = author || 'Anonymous';

    // Try to get user from token if provided (optional auth)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        const user = await User.findById(decoded.id);
        if (user) {
          authorId = user._id;
          authorName = user.name;
        }
      } catch (err) {
        // Token invalid or expired, continue with anonymous submission
        console.log('Optional auth failed, using anonymous submission');
      }
    }

    // Validate author name is provided if not authenticated
    if (!authorId && !author) {
      return res.status(400).json({
        error: 'Author name is required for anonymous submissions'
      });
    }

    const experience = await Experience.create({
      company,
      role,
      branch,
      year: parseInt(year),
      rounds,
      package: pkg,
      tips: tips || '',
      interviewDate: interviewDate || new Date(),
      offerStatus: offerStatus || 'Pending',
      author: authorId,
      authorName: authorName,
      moderationStatus: 'pending', // All new experiences require moderation
    });

    const populatedExperience = await Experience.findById(experience._id)
      .populate('author', 'name email role branch');

    res.status(201).json(populatedExperience);
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/experiences/:id - Update experience (Protected - only author or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    let experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Check if user is author or admin
    if (experience.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this experience' });
    }

    experience = await Experience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email role branch');

    res.json(experience);
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/experiences/:id - Delete experience (Protected - only author or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Check if user is author or admin
    if (experience.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this experience' });
    }

    await Experience.findByIdAndDelete(req.params.id);

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/experiences/:id/report - Report an experience (Optional auth)
router.post('/:id/report', async (req, res) => {
  try {
    const { reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Try to get user from token if provided (optional auth)
    let reportedBy = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        const user = await User.findById(decoded.id);
        if (user) {
          reportedBy = user._id;
        }
      } catch (err) {
        // Token invalid or expired, continue with anonymous report
      }
    }

    const report = await Report.create({
      experience: experience._id,
      reportedBy,
      reason,
      description: description || '',
    });

    const populated = await Report.findById(report._id)
      .populate('experience', 'company role')
      .populate('reportedBy', 'name username');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: populated,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
