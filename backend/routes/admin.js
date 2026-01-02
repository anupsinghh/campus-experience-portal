const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Experience = require('../models/Experience');
const Report = require('../models/Report');
const Announcement = require('../models/Announcement');
const CompanyStandardization = require('../models/CompanyStandardization');
const User = require('../models/User');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// ==================== MODERATION ROUTES ====================

// GET /api/admin/experiences/pending - Get all pending experiences
router.get('/experiences/pending', async (req, res) => {
  try {
    const experiences = await Experience.find({ moderationStatus: 'pending' })
      .populate('author', 'name username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    console.error('Error fetching pending experiences:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/admin/experiences - Get all experiences (for admin)
router.get('/experiences', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.moderationStatus = status;
    }

    const experiences = await Experience.find(query)
      .populate('author', 'name username email')
      .populate('moderatedBy', 'name username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/admin/experiences/:id/approve - Approve an experience
router.put('/experiences/:id/approve', async (req, res) => {
  try {
    const { notes } = req.body;
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        error: 'Experience not found',
      });
    }

    experience.moderationStatus = 'approved';
    experience.moderatedBy = req.user._id;
    experience.moderatedAt = new Date();
    if (notes) experience.moderationNotes = notes;

    await experience.save();

    const populated = await Experience.findById(experience._id)
      .populate('author', 'name username email')
      .populate('moderatedBy', 'name username');

    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Error approving experience:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/admin/experiences/:id/reject - Reject an experience
router.put('/experiences/:id/reject', async (req, res) => {
  try {
    const { notes } = req.body;
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        error: 'Experience not found',
      });
    }

    experience.moderationStatus = 'rejected';
    experience.moderatedBy = req.user._id;
    experience.moderatedAt = new Date();
    if (notes) experience.moderationNotes = notes;

    await experience.save();

    const populated = await Experience.findById(experience._id)
      .populate('author', 'name username email')
      .populate('moderatedBy', 'name username');

    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Error rejecting experience:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/admin/experiences/:id - Update experience (admin can edit any)
router.put('/experiences/:id', async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('author', 'name username email')
      .populate('moderatedBy', 'name username');

    if (!experience) {
      return res.status(404).json({
        success: false,
        error: 'Experience not found',
      });
    }

    res.json({
      success: true,
      data: experience,
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/admin/experiences/:id - Delete experience
router.delete('/experiences/:id', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        error: 'Experience not found',
      });
    }

    await Experience.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Experience deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==================== COMPANY STANDARDIZATION ROUTES ====================

// GET /api/admin/companies/all - Get all unique company names from experiences
router.get('/companies/all', async (req, res) => {
  try {
    const companies = await Experience.distinct('company');
    const companiesWithCounts = await Promise.all(
      companies.map(async (companyName) => {
        const count = await Experience.countDocuments({ company: companyName });
        return {
          name: companyName,
          count: count,
        };
      })
    );
    
    // Sort by count descending, then by name
    companiesWithCounts.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

    res.json({
      success: true,
      count: companiesWithCounts.length,
      data: companiesWithCounts,
    });
  } catch (error) {
    console.error('Error fetching all companies:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/admin/companies - Get all company standardizations
router.get('/companies', async (req, res) => {
  try {
    const standardizations = await CompanyStandardization.find()
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username')
      .sort({ standardName: 1 });

    res.json({
      success: true,
      count: standardizations.length,
      data: standardizations,
    });
  } catch (error) {
    console.error('Error fetching company standardizations:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/admin/companies - Create company standardization
router.post('/companies', async (req, res) => {
  try {
    const { standardName, variations } = req.body;

    if (!standardName) {
      return res.status(400).json({
        success: false,
        error: 'Standard company name is required',
      });
    }

    const standardization = await CompanyStandardization.create({
      standardName: standardName.trim(),
      variations: variations || [],
      createdBy: req.user._id,
    });

    const populated = await CompanyStandardization.findById(standardization._id)
      .populate('createdBy', 'name username');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Error creating company standardization:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/admin/companies/:id - Update company standardization
router.put('/companies/:id', async (req, res) => {
  try {
    const { standardName, variations } = req.body;

    const standardization = await CompanyStandardization.findById(req.params.id);

    if (!standardization) {
      return res.status(404).json({
        success: false,
        error: 'Company standardization not found',
      });
    }

    if (standardName) standardization.standardName = standardName.trim();
    if (variations) standardization.variations = variations;
    standardization.updatedBy = req.user._id;

    await standardization.save();

    const populated = await CompanyStandardization.findById(standardization._id)
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username');

    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Error updating company standardization:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/admin/companies/standardize - Standardize company names in experiences
router.post('/companies/standardize', async (req, res) => {
  try {
    const { experienceId, standardName } = req.body;

    if (!experienceId || !standardName) {
      return res.status(400).json({
        success: false,
        error: 'Experience ID and standard name are required',
      });
    }

    const experience = await Experience.findById(experienceId);

    if (!experience) {
      return res.status(404).json({
        success: false,
        error: 'Experience not found',
      });
    }

    // Update company name
    experience.company = standardName;
    await experience.save();

    res.json({
      success: true,
      data: experience,
    });
  } catch (error) {
    console.error('Error standardizing company name:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/admin/companies/:id - Delete company standardization
router.delete('/companies/:id', async (req, res) => {
  try {
    const standardization = await CompanyStandardization.findById(req.params.id);

    if (!standardization) {
      return res.status(404).json({
        success: false,
        error: 'Company standardization not found',
      });
    }

    await CompanyStandardization.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Company standardization deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting company standardization:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==================== REPORTS ROUTES ====================

// GET /api/admin/reports - Get all reports
router.get('/reports', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate({
        path: 'experience',
        select: 'company role authorName branch year package offerStatus rounds tips views createdAt moderationStatus'
      })
      .populate('reportedBy', 'name username email')
      .populate('reviewedBy', 'name username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/admin/reports/:id/review - Review a report
router.put('/reports/:id/review', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    if (status) report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();

    await report.save();

    const populated = await Report.findById(report._id)
      .populate({
        path: 'experience',
        select: 'company role authorName branch year package offerStatus rounds tips views createdAt moderationStatus'
      })
      .populate('reportedBy', 'name username email')
      .populate('reviewedBy', 'name username');

    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Error reviewing report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/admin/reports/:id - Delete report
router.delete('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==================== ANNOUNCEMENTS ROUTES ====================

// GET /api/admin/announcements - Get all announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find()
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

// POST /api/admin/announcements - Create announcement
router.post('/announcements', async (req, res) => {
  try {
    const { title, content, type, priority, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required',
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      type: type || 'general',
      priority: priority || 'medium',
      publishedBy: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('publishedBy', 'name username');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/admin/announcements/:id - Update announcement
router.put('/announcements/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found',
      });
    }

    Object.assign(announcement, req.body);
    if (req.body.expiresAt) {
      announcement.expiresAt = new Date(req.body.expiresAt);
    }

    await announcement.save();

    const populated = await Announcement.findById(announcement._id)
      .populate('publishedBy', 'name username');

    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/admin/announcements/:id - Delete announcement
router.delete('/announcements/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==================== STATS ROUTES ====================

// GET /api/admin/stats - Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      pendingExperiences,
      totalExperiences,
      pendingReports,
      totalReports,
      activeAnnouncements,
      totalAnnouncements,
    ] = await Promise.all([
      Experience.countDocuments({ moderationStatus: 'pending' }),
      Experience.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments(),
      Announcement.countDocuments({ isActive: true }),
      Announcement.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        experiences: {
          pending: pendingExperiences,
          total: totalExperiences,
        },
        reports: {
          pending: pendingReports,
          total: totalReports,
        },
        announcements: {
          active: activeAnnouncements,
          total: totalAnnouncements,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==================== UTILITY ROUTES ====================

// POST /api/admin/experiences/reset-moderation - Reset all experiences to pending (one-time migration)
router.post('/experiences/reset-moderation', async (req, res) => {
  try {
    const result = await Experience.updateMany(
      { moderationStatus: { $ne: 'pending' } },
      { 
        $set: { 
          moderationStatus: 'pending',
          moderatedBy: null,
          moderatedAt: null,
          moderationNotes: null
        } 
      }
    );

    res.json({
      success: true,
      message: `Reset ${result.modifiedCount} experiences to pending status`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error resetting moderation status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==================== USERS ROUTES ====================

// GET /api/admin/users - Get all users with optional filters
router.get('/users', async (req, res) => {
  try {
    const { branch, graduationYear, role, search } = req.query;
    const query = {};

    // Build query filters
    if (branch) {
      query.branch = { $regex: branch, $options: 'i' };
    }

    if (graduationYear) {
      query.graduationYear = parseInt(graduationYear);
    }

    if (role) {
      query.role = role;
    }

    let users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Search across multiple fields
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/admin/users/filters - Get unique filter options
router.get('/users/filters', async (req, res) => {
  try {
    const [branches, years, roles] = await Promise.all([
      User.distinct('branch').then(branches => branches.filter(Boolean).sort()),
      User.distinct('graduationYear').then(years => years.filter(Boolean).sort((a, b) => b - a)),
      User.distinct('role').then(roles => roles.filter(Boolean).sort()),
    ]);

    res.json({
      success: true,
      data: {
        branches,
        years,
        roles,
      },
    });
  } catch (error) {
    console.error('Error fetching user filters:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

