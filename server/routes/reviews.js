const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  updateReviewStatus,
  addReviewReply
} = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

const { protect, authorize, optionalProtect } = require('../middleware/auth');

router.route('/')
  .get(optionalProtect, getReviews)
  .post(protect, authorize('user', 'b2b', 'admin'), addReview);

router.route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.put('/:id/status', protect, authorize('admin'), updateReviewStatus);
router.put('/:id/reply', protect, addReviewReply);

module.exports = router;
