const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// GET /api/metrics/model - Return saved model metrics JSON (if present).
router.get('/model', (req, res) => {
  try {
    const modelPath =
      process.env.ML_MODEL_PATH || path.join(__dirname, '..', 'models', 'vitamin_model.pkl');
    const metricsPath = modelPath.replace(/\.pkl$/i, '_metrics.json');

    if (!fs.existsSync(metricsPath)) {
      return res.status(404).json({
        error: 'METRICS_NOT_FOUND',
        message: 'Model metrics JSON not found. Re-train the model to generate it.',
        expectedPath: metricsPath,
      });
    }

    const raw = fs.readFileSync(metricsPath, 'utf8');
    return res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Metrics error:', err);
    return res.status(500).json({
      error: 'METRICS_ERROR',
      message: 'Failed to load model metrics.',
    });
  }
});

module.exports = router;

