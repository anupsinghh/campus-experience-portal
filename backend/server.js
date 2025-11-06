const express = require('express');
const cors = require('cors');
const experiencesRoutes = require('./routes/experiences');
const companiesRoutes = require('./routes/companies');
const insightsRoutes = require('./routes/insights');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Routes
app.use('/api/experiences', experiencesRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/insights', insightsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

