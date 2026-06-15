const express = require('express');
const { getSettings, updateSettings, uploadSettingsImages } = require('../controllers/settings');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public route to get settings
router.get('/', getSettings);

// Admin-only route to update settings (with image upload)
router.put('/', protect, authorize('admin'), uploadSettingsImages, updateSettings);

module.exports = router;
