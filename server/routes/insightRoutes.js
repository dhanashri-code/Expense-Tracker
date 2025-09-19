const express = require('express');
const { getInsights, getExpenseInsights, getAIInsights } = require('../controllers/insightController');

const router = express.Router();

// Legacy insights
router.get('/', getInsights);

// Dashboard Insights (with optional ?filter=day|week|month|year|all)
router.get('/dashboard', getExpenseInsights);

// AI Insights
router.post('/ai', getAIInsights);

module.exports = router;
