const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const predictionRoutes = require('./routes/prediction');
const metricsRoutes = require('./routes/metrics');
const authRoutes = require('./routes/auth');

const app = express();
const BASE_PORT = Number.parseInt(process.env.PORT, 10) || 5000;
const PORT_SEARCH_RANGE = Number.parseInt(process.env.PORT_SEARCH_RANGE, 10) || 20;

/**
 * Read JSON bodies explicitly. On some setups (Node 24 / certain proxies) express.json()
 * can leave req.body empty even when the client sends valid JSON.
 */
function readJsonBody(req, res, next) {
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    return next();
  }
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (!ct.includes('application/json')) {
    if (req.body === undefined) req.body = {};
    return next();
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    try {
      const raw = Buffer.concat(chunks).toString('utf8');
      req.body = raw && raw.trim() ? JSON.parse(raw) : {};
    } catch (err) {
      return res.status(400).json({
        error: 'Invalid JSON',
        message: err instanceof Error ? err.message : 'Parse error',
      });
    }
    next();
  });
  req.on('error', next);
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(morgan('combined')); // HTTP request logger
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // form posts only; skips JSON
app.use(readJsonBody);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/', limiter);

// Routes
app.use('/api/predict', predictionRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Vitamin Deficiency Prediction API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Vitamin Deficiency Prediction System API',
    version: '1.0.1',
    endpoints: {
      health: '/api/health',
      predict: '/api/predict',
      documentation: 'https://github.com/your-repo/vitamin-prediction-api'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET /api/metrics/model',
      'POST /api/predict (auth required)'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

// Start server (try BASE_PORT, then next ports if EADDRINUSE — avoids crash when 5000 is taken)
function startListening(port) {
  const maxPort = port + PORT_SEARCH_RANGE;
  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port + 1 <= maxPort) {
      console.warn(`[server] Port ${port} is already in use; trying ${port + 1}…`);
      startListening(port + 1);
      return;
    }
    if (err.code === 'EADDRINUSE') {
      console.error(`[server] No free port between ${BASE_PORT} and ${maxPort}.`);
      console.error('[server] Free a port on Windows, for example:');
      console.error('  netstat -ano | findstr :5000');
      console.error('  taskkill /PID <pid> /F');
    } else {
      console.error('[server] Listen error:', err);
    }
    process.exit(1);
  });

  server.listen(port, () => {
    if (port !== BASE_PORT) {
      console.warn('');
      console.warn('--------------------------------------------------------------');
      console.warn(`  Server bound to port ${port} (default ${BASE_PORT} was busy).`);
      console.warn('  React app: set in frontend/.env.development:');
      console.warn(`  REACT_APP_API_URL=http://localhost:${port}`);
      console.warn('  Then restart the frontend dev server.');
      console.warn('--------------------------------------------------------------');
      console.warn('');
    }
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
    console.log(`🔮 Prediction endpoint: http://localhost:${port}/api/predict`);
  });
}

startListening(BASE_PORT);

module.exports = app;
