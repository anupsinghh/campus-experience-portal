const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');

// GET /api/companies - Get all unique companies with stats
router.get('/', async (req, res) => {
  try {
    const experiences = await Experience.find();
    const companyMap = {};

    experiences.forEach(exp => {
      if (!companyMap[exp.company]) {
        companyMap[exp.company] = {
          name: exp.company,
          totalExperiences: 0,
          roles: new Set(),
          branches: new Set(),
          years: new Set(),
          packages: []
        };
      }

      companyMap[exp.company].totalExperiences++;
      companyMap[exp.company].roles.add(exp.role);
      companyMap[exp.company].branches.add(exp.branch);
      companyMap[exp.company].years.add(exp.year);
      if (exp.package) {
        companyMap[exp.company].packages.push(exp.package);
      }
    });

    // Convert Sets to Arrays for JSON response
    const companies = Object.values(companyMap).map(company => ({
      name: company.name,
      totalExperiences: company.totalExperiences,
      roles: Array.from(company.roles),
      branches: Array.from(company.branches),
      years: Array.from(company.years).sort((a, b) => b - a),
      packages: company.packages
    }));

    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
