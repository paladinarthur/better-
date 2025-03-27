const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// POST submit application
router.post('/', applicationController.submitApplication);

// GET user applications
router.get('/user/:userId', applicationController.getUserApplications);

module.exports = router; 