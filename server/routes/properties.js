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
const { protect, authorize, optionalProtect } = require('../middleware/auth');

router.route('/')
  .get(optionalProtect, getProperties)
  .post(protect, authorize('b2b', 'admin'), createProperty);

router.route('/:id')
  .get(optionalProtect, getProperty)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

router.put('/:id/publish', protect, togglePublish);
router.put('/:id/rooms/:roomTypeId/availability', protect, toggleRoomAvailability);

module.exports = router;
