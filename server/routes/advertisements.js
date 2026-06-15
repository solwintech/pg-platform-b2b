const express = require('express');
const {
  getAds,
  getAdsByLocation,
  createAd,
  updateAd,
  deleteAd,
  recordClick,
  uploadAdImage
} = require('../controllers/advertisements');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/location/:location', getAdsByLocation);
router.put('/:id/click', recordClick);

// Admin-only routes (with optional image upload via multipart/form-data)
router.route('/')
  .get(getAds)
  .post(protect, authorize('admin'), uploadAdImage, createAd);

router.route('/:id')
  .put(protect, authorize('admin'), uploadAdImage, updateAd)
  .delete(protect, authorize('admin'), deleteAd);

module.exports = router;
