const Property = require('../models/Property');
const logActivity = require('../utils/logger');

// @desc    Get all properties for the logged in user
// @route   GET /api/v1/properties
// @access  Private
exports.getProperties = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Property.find().populate('owner', 'name email');
    } else {
      query = Property.find({ owner: req.user.id });
    }

    const properties = await query;
    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single property
// @route   GET /api/v1/properties/:id
// @access  Private
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to access this property' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new property
// @route   POST /api/v1/properties
// @access  Private (B2B/Admin)
exports.createProperty = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.owner = req.user.id;
    req.body.status = 'pending'; // New properties are always pending

    const property = await Property.create(req.body);

    res.status(201).json({ success: true, data: property });
    
    logActivity({
      action: 'CREATE_PROPERTY',
      performedBy: req.user.id,
      targetModel: 'Property',
      targetId: property._id,
      after: property.toObject(),
      details: `New property created: ${property.pgName}`
    }, req);

  } catch (err) {
    console.error('Property Creation Error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update property
// @route   PUT /api/v1/properties/:id
// @access  Private
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this property' });
    }

    const before = property.toObject();
    
    // If not admin, check if restricted fields were changed
    if (req.user.role !== 'admin') {
      // Define all fields from Basic Info and Location steps
      const basicInfoFields = ['propertyType', 'pgName', 'managerName', 'managerPhone', 'managerEmail', 'postedBy', 'postedByName'];
      const locationFields = ['area', 'address', 'city', 'pinCode', 'latitude', 'longitude', 'nearbyPlaces'];
      const restrictedFields = [...basicInfoFields, ...locationFields];
      
      let restrictedFieldChanged = false;
      const modifiedFields = [];
      const oldValues = {};
      
      for (const field of restrictedFields) {
        // Handle array comparison for nearbyPlaces
        if (field === 'nearbyPlaces') {
          const isSame = JSON.stringify(req.body[field]) === JSON.stringify(property[field]);
          if (req.body[field] !== undefined && !isSame) {
            restrictedFieldChanged = true;
            modifiedFields.push(field);
            oldValues[field] = property[field];
          }
          continue;
        }

        if (req.body[field] !== undefined && String(req.body[field]) !== String(property[field])) {
          restrictedFieldChanged = true;
          modifiedFields.push(field);
          oldValues[field] = property[field];
        }
      }

      if (restrictedFieldChanged) {
        req.body.status = 'pending';
        req.body.isReapproval = true;
        req.body.changedFields = modifiedFields;
        req.body.previousValues = oldValues;
      } else {
        // Prevent manual status override by user if no restricted fields changed
        delete req.body.status;
      }
    }

    // Reset reapproval flags if status is changed back to approved (by admin)
    if (req.user.role === 'admin' && req.body.status === 'approved') {
      req.body.isReapproval = false;
      req.body.changedFields = [];
      req.body.previousValues = {};
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: property });
    
    // Log update
    logActivity({
      action: 'UPDATE_PROPERTY',
      performedBy: req.user.id,
      targetModel: 'Property',
      targetId: property._id,
      before,
      after: property.toObject(),
      details: `Property updated: ${property.pgName}`
    }, req);

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/v1/properties/:id
// @access  Private
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this property' });
    }

    const before = property.toObject();
    await property.deleteOne();

    res.status(200).json({ success: true, data: {} });
    
    // Log deletion
    logActivity({
      action: 'DELETE_PROPERTY',
      performedBy: req.user.id,
      targetModel: 'Property',
      targetId: req.params.id,
      before,
      details: `Property deleted: ${before.pgName}`
    }, req);

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// @desc    Toggle property publication status
// @route   PUT /api/v1/properties/:id/publish
// @access  Private
exports.togglePublish = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this property' });
    }

    const before = property.toObject();
    
    property.isPublished = !property.isPublished;
    await property.save();

    res.status(200).json({ success: true, data: property });
    
    // Log update
    logActivity({
      action: property.isPublished ? 'PUBLISH_PROPERTY' : 'UNPUBLISH_PROPERTY',
      performedBy: req.user.id,
      targetModel: 'Property',
      targetId: property._id,
      before,
      after: property.toObject(),
      details: `Property ${property.isPublished ? 'published' : 'unpublished'}: ${property.pgName}`
    }, req);

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Toggle room availability status
// @route   PUT /api/v1/properties/:id/rooms/:roomTypeId/availability
// @access  Private
exports.toggleRoomAvailability = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this property' });
    }

    const roomTypeId = req.params.roomTypeId;
    
    // Update roomTypes array - handle both _id (MongoDB) and id/name (Legacy)
    const roomType = property.roomTypes.find(rt => 
      (rt._id && rt._id.toString() === roomTypeId) || 
      (rt.id && rt.id.toString() === roomTypeId) ||
      (rt.name === roomTypeId)
    );
    
    if (!roomType) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }

    roomType.isAvailable = roomType.isAvailable === false ? true : false;
    
    // Mark roomTypes as modified for Mongoose
    property.markModified('roomTypes');
    await property.save();

    res.status(200).json({ success: true, data: property });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
