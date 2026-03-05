const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { ensureSchema } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tmdbRoutes = require('./routes/tmdbRoutes');

dotenv.config();

const app = express();

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Root route - avoid "Cannot GET /" on deployed URL
app.get('/', (req, res) => {
  res.json({
    name: 'KodFlix API',
    status: 'running',
    health: '/api/health',
    auth: '/api/auth (signup, login, me, logout)',
    movies: '/api/movies (trending, top-rated, action, comedy)',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', tmdbRoutes);

const port = process.env.PORT || 5000;

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`KodFlix backend listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database schema', err);
    process.exit(1);
  });

