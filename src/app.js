const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const indexRoutes = require('./routes/index');
const languagesRoutes = require('./routes/languages');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const languageService = require('./services/language.service');

// Load translation catalogs into memory at startup
languageService.loadCatalogs();

const app = express();

// Trust proxy (needed behind Render / reverse proxies for correct rate-limit IPs)
app.set('trust proxy', 1);

// Parse JSON bodies (not strictly required for this read-only API, but good practice)
app.use(express.json({ limit: '16kb' }));

// CORS configuration from environment
const corsOrigin = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: corsOrigin === '*' ? true : corsOrigin.split(',').map(o => o.trim()),
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 86400
};
app.use(cors(corsOptions));

// Basic rate limiting
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 min
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;

const limiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});
app.use(limiter);

// Routes
app.use('/', indexRoutes);
app.use('/languages', languagesRoutes);

// 404 for unknown routes
app.use(notFoundHandler);

// Central error handler (must be last)
app.use(errorHandler);

module.exports = app;