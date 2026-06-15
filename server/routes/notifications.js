const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notifications');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getNotifications);
router.route('/:id/read').put(markAsRead);
router.route('/read-all').put(markAllAsRead);

module.exports = router;
