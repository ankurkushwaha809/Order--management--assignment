const express = require('express');
const router = express.Router();
const { triggerScheduler, getSchedulerLogs } = require('../controllers/schedulerController');
const { authenticateScheduler } = require('../middleware/auth');

// Protected endpoint to manually run the scheduler
router.post('/run', authenticateScheduler, triggerScheduler);

// Public endpoint to view logs on React dashboard
router.get('/logs', getSchedulerLogs);

module.exports = router;
