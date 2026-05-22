const express = require('express');
const {
  getAds,
  getAdsByLocation,
  createAd,
  updateAd,
  deleteAd,
  recordClick
} = require('../controllers/advertisements');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAds)
  .post(protect, authorize('admin'), createAd);

router.route('/:id')
  .put(protect, authorize('admin'), updateAd)
  .delete(protect, authorize('admin'), deleteAd);

router.get('/location/:location', getAdsByLocation);
router.put('/:id/click', recordClick);

module.exports = router;
