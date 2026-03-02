const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Liveness probe — used by ZAP DAST scan as the target baseline.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'devsecops-demo-api',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

/**
 * GET /health/ready
 * Readiness probe — checks dependencies before accepting traffic.
 */
router.get('/ready', (req, res) => {
  // In a real app: check DB connections, external services, etc.
  res.status(200).json({ ready: true });
});

module.exports = router;
