const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');

// GET /api/insights - Get analytics and insights
router.get('/', async (req, res) => {
  try {
    const experiences = await Experience.find();

    // Extract all questions
    const allQuestions = [];
    experiences.forEach(exp => {
      exp.rounds.forEach(round => {
        round.questions.forEach(question => {
          allQuestions.push({
            question,
            company: exp.company,
            role: exp.role,
            roundName: round.roundName
          });
        });
      });
    });

    // Extract package values (remove 'LPA', '$', 'USD' and convert to number)
    const packages = experiences
      .filter(exp => exp.package)
      .map(exp => {
        // Remove currency symbols and text, keep only numbers
        let packageStr = exp.package.toString()
          .replace(/[$₹]/g, '') // Remove $ and ₹ symbols
          .replace(/LPA/gi, '') // Remove LPA
          .replace(/USD/gi, '') // Remove USD
          .replace(/INR/gi, '') // Remove INR
          .trim();
        const packageValue = parseFloat(packageStr);
        return {
          value: packageValue,
          company: exp.company,
          role: exp.role,
          year: exp.year
        };
      })
      .filter(pkg => !isNaN(pkg.value));

    // Calculate statistics
    const totalExperiences = experiences.length;
    const uniqueCompanies = new Set(experiences.map(exp => exp.company)).size;
    const uniqueRoles = new Set(experiences.map(exp => exp.role)).size;
    
    const avgPackage = packages.length > 0
      ? packages.reduce((sum, pkg) => sum + pkg.value, 0) / packages.length
      : 0;

    const maxPackage = packages.length > 0
      ? Math.max(...packages.map(pkg => pkg.value))
      : 0;

    const minPackage = packages.length > 0
      ? Math.min(...packages.map(pkg => pkg.value))
      : 0;

    // Most common questions (simple frequency count)
    const questionFrequency = {};
    allQuestions.forEach(q => {
      const questionLower = q.question.toLowerCase();
      questionFrequency[questionLower] = (questionFrequency[questionLower] || 0) + 1;
    });

    const frequentQuestions = Object.entries(questionFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([question, count]) => ({ question, count }));

    // Company distribution
    const companyDistribution = {};
    experiences.forEach(exp => {
      companyDistribution[exp.company] = (companyDistribution[exp.company] || 0) + 1;
    });

    // Year distribution
    const yearDistribution = {};
    experiences.forEach(exp => {
      yearDistribution[exp.year] = (yearDistribution[exp.year] || 0) + 1;
    });

    // Role distribution
    const roleDistribution = {};
    experiences.forEach(exp => {
      roleDistribution[exp.role] = (roleDistribution[exp.role] || 0) + 1;
    });

    res.json({
      overview: {
        totalExperiences,
        uniqueCompanies,
        uniqueRoles,
        avgPackage: avgPackage.toFixed(2),
        maxPackage,
        minPackage
      },
      frequentQuestions,
      companyDistribution,
      yearDistribution,
      roleDistribution,
      packageTrends: packages.sort((a, b) => b.value - a.value).slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/insights/questions - Search questions by company or role
router.get('/questions', async (req, res) => {
  try {
    const { company, role } = req.query;
    
    // Build query
    const query = {};
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }
    if (role) {
      query.role = { $regex: role, $options: 'i' };
    }

    const experiences = await Experience.find(query);

    // Get available roles for the selected company
    let availableRoles = [];
    if (company) {
      const companyExperiences = await Experience.find({ company: { $regex: company, $options: 'i' } });
      availableRoles = [...new Set(companyExperiences.map(exp => exp.role).filter(Boolean))].sort();
    }

    // Extract all questions with metadata
    const allQuestions = [];
    experiences.forEach(exp => {
      exp.rounds.forEach(round => {
        round.questions.forEach(question => {
          // Infer difficulty level from round name
          let level = 'Medium'; // default
          const roundNameLower = round.roundName.toLowerCase();
          if (roundNameLower.includes('easy') || roundNameLower.includes('basic') || roundNameLower.includes('screening')) {
            level = 'Easy';
          } else if (roundNameLower.includes('hard') || roundNameLower.includes('system design') || roundNameLower.includes('advanced') || roundNameLower.includes('final')) {
            level = 'Hard';
          } else if (roundNameLower.includes('medium') || roundNameLower.includes('technical')) {
            level = 'Medium';
          }

          allQuestions.push({
            question,
            company: exp.company,
            role: exp.role,
            roundNumber: round.roundNumber,
            roundName: round.roundName,
            level: level,
            year: exp.year
          });
        });
      });
    });

    res.json({
      success: true,
      questions: allQuestions,
      total: allQuestions.length,
      availableRoles: availableRoles
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
