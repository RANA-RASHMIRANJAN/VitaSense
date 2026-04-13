const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction');

// POST /api/predict - Get vitamin deficiency prediction
router.post('/', predictionController.predict);

module.exports = router;
