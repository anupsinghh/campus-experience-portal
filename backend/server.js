const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const experiencesRoutes = require('./routes/experiences');
const companiesRoutes = require('./routes/companies');
const insightsRoutes = require('./routes/insights');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const commentsRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const announcementsRoutes = require('./routes/announcements');
const notificationsRoutes = require('./routes/notifications');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Allow multiple origins via comma-separated CORS_ORIGIN, or "*" for all
const corsOriginEnv = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin (no origin header)
    if (!origin || corsOriginEnv === '*') return callback(null, true);
    
    const hardcodedAllowedOrigins = [
  'https://campus-experience-portal.vercel.app',
  'https://placements.singhanup.in',
];

if (hardcodedAllowedOrigins.includes(origin)) {
  return callback(null, true);
}

    
    const whitelist = corsOriginEnv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// JSON body parser with explicit limits for production
app.use(express.json({ 
  limit: '10mb',
  strict: true 
}));

// Log all incoming requests for debugging (can be removed in production if needed)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    console.log(`${req.method} ${req.path} - Content-Type: ${req.headers['content-type']}`);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/experiences/:experienceId/comments', commentsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/experiences', experiencesRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
