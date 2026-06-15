const express = require('express');
const router = express.Router();
const { 
  getProperties, 
  getProperty, 
  createProperty, 
  updateProperty, 
  deleteProperty,
  togglePublish,
  toggleRoomAvailability,
  incrementPropertyViews
} = require('../controllers/properties');
const { protect, authorize, optionalProtect } = require('../middleware/auth');

const propertyUpload = require('../utils/propertyUpload');

// Include other resource routers
const reviewRouter = require('./reviews');

// Re-route into other resource routers
router.use('/:propertyId/reviews', reviewRouter);

router.route('/')
  .get(optionalProtect, getProperties)
  .post(protect, authorize('b2b', 'admin'), propertyUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
    { name: 'roomImages', maxCount: 20 }
  ]), createProperty);

router.route('/:id')
  .get(optionalProtect, getProperty)
  .put(protect, propertyUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
    { name: 'roomImages', maxCount: 20 }
  ]), updateProperty)
  .delete(protect, deleteProperty);

router.put('/:id/publish', protect, togglePublish);
router.put('/:id/rooms/:roomTypeId/availability', protect, toggleRoomAvailability);
router.put('/:id/click', incrementPropertyViews);

module.exports = router;
