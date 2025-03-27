const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET user preferences
router.get('/preferences/:userId', userController.getUserPreferences);

// POST save user preferences
router.post('/preferences', userController.saveUserPreferences);

// PUT update user preferences
router.put('/preferences/:userId', userController.updateUserPreferences);

module.exports = router; 