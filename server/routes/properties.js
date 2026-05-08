const express = require('express');
const router = express.Router();
const { 
  getProperties, 
  getProperty, 
  createProperty, 
  updateProperty, 
  deleteProperty,
  togglePublish,
  toggleRoomAvailability
} = require('../controllers/properties');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All property routes are protected

router.route('/')
  .get(getProperties)
  .post(authorize('b2b', 'admin'), createProperty);

router.route('/:id')
  .get(getProperty)
  .put(updateProperty)
  .delete(deleteProperty);

router.put('/:id/publish', togglePublish);
router.put('/:id/rooms/:roomTypeId/availability', toggleRoomAvailability);

module.exports = router;
