const Property = require('../models/Property');
const notifyAdmins = require('../utils/notifyAdmins');
const logActivity = require('../utils/logger');
const { broadcastEvent, sendEventToUser } = require('../utils/sse');
// @desc    Get all properties for the logged in user
// @route   GET /api/v1/properties
// @access  Private
exports.getProperties = async (req, res, next) => {
  try {
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from direct matching
    const removeFields = ['select', 'sort', 'page', 'limit', 'minPrice', 'maxPrice', 'gender', 'public'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string for advanced operators
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    const baseFilter = JSON.parse(queryStr);

    // Manually handle Price filter
    if (req.query.minPrice || req.query.maxPrice) {
      const priceQuery = {};
      if (req.query.minPrice && Number(req.query.minPrice) > 0) {
        priceQuery.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice && Number(req.query.maxPrice) < 50000) {
        priceQuery.$lte = Number(req.query.maxPrice);
      }
      if (Object.keys(priceQuery).length > 0) {
        baseFilter['roomTypes.price'] = priceQuery;
      }
    }

    // Manually handle Gender filter
    if (req.query.gender && req.query.gender !== 'all') {
      const g = req.query.gender.toLowerCase();
      if (g === 'male' || g === 'boys') {
        baseFilter.genderAllowed = 'Boys';
      } else if (g === 'female' || g === 'girls') {
        baseFilter.genderAllowed = 'Girls';
      } else if (g === 'any' || g === 'unisex' || g === 'co-ed') {
        baseFilter.genderAllowed = 'Unisex';
      }
    }

    // Role-based logic
    if (req.query.public === 'true' || !req.user || req.user.role === 'user') {
      // Public / Customer User: Only approved and published properties
      baseFilter.status = 'approved';
      baseFilter.isPublished = true;
      query = Property.find(baseFilter);
    } else if (req.user.role === 'admin') {
      // Admin: All properties
      query = Property.find(baseFilter).populate('owner', 'name email');
    } else if (req.user.role === 'b2b') {
      // B2B Owner: Only their own properties
      baseFilter.owner = req.user.id;
      query = Property.find(baseFilter);
    } else {
      // Fallback: Default to approved/published properties
      baseFilter.status = 'approved';
      baseFilter.isPublished = true;
      query = Property.find(baseFilter);
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Property.countDocuments(baseFilter);

    query = query.skip(startIndex).limit(limit).populate('owner', 'name email profileImage role');

    const properties = await query;

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pagination: {
        page,
        limit
      },
      data: properties,
      properties: properties // Keep for backward compatibility
    });
  } catch (err) {
    console.error(`[getProperties] Error: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single property
// @route   GET /api/v1/properties/:id
// @access  Private
exports.getProperty = async (req, res, next) => {
  try {
    const idOrSlug = req.params.id;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    
    const property = await Property.findOne(query).populate('owner', 'name email profileImage role');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Public / Shared Access: Allow anyone to view if property is approved and published
    if (property.status === 'approved' && property.isPublished) {
      return res.status(200).json({ success: true, data: property });
    }

    // Restrict access to unpublished/unapproved properties to only the owner or an admin
    const ownerId = property.owner?._id || property.owner;
    if (!req.user || (ownerId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this property' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const fs = require('fs');
const path = require('path');

const deleteFiles = (files) => {
  files.forEach(file => {
    if (file && file.startsWith('uploads/')) {
      const p = path.join(__dirname, '../public', file);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (e) { console.error('Error deleting file:', e); }
      }
    }
  });
};

// @desc    Create new property
// @route   POST /api/v1/properties
// @access  Private (B2B/Admin)
exports.createProperty = async (req, res, next) => {
  try {
    // Add user to req.body
    if (req.user.role === 'admin' && req.body.owner) {
      // Use the provided owner if admin is creating it
    } else {
      req.body.owner = req.user.id;
    }

    if (req.user.role === 'admin') {
      req.body.status = 'approved';
      req.body.isPublished = true;
    } else {
      req.body.status = 'pending'; // New properties are always pending for B2B
    }

    // Parse JSON fields from formData
    const jsonFields = ['roomTypes', 'amenities', 'nearbyPlaces', 'visitingHours', 'galleryImages'];
    jsonFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try { req.body[field] = JSON.parse(req.body[field]); } catch (e) { }
      }
    });

    // Handle uploaded files
    if (req.files) {
      if (req.files.coverImage) {
        req.body.coverImage = `uploads/properties/${req.files.coverImage[0].filename}`;
      }
      if (req.files.galleryImages) {
        // If frontend passes galleryTags as JSON array corresponding to files
        let galleryTags = [];
        if (req.body.galleryTags) {
          try { galleryTags = JSON.parse(req.body.galleryTags); } catch (e) {}
        }
        
        const newGallery = req.files.galleryImages.map((file, index) => ({
          url: `uploads/properties/${file.filename}`,
          tag: galleryTags[index] || ''
        }));
        
        req.body.galleryImages = [...(req.body.galleryImages || []), ...newGallery];
      }
      if (req.files.roomImages && req.body.roomTypes) {
        let fileIndex = 0;
        req.body.roomTypes.forEach(rt => {
          if (rt.hasNewImage && fileIndex < req.files.roomImages.length) {
            rt.image = `uploads/properties/${req.files.roomImages[fileIndex].filename}`;
            fileIndex++;
          }
          delete rt.hasNewImage;
        });
      }
    }

    const property = await Property.create(req.body);

    await notifyAdmins(req, `New property "${property.pgName}" submitted for approval.`, 'property', property._id);

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

    // Prevent owner field from being overwritten or causing cast errors
    if (req.body.owner) {
      delete req.body.owner;
    }

    const before = property.toObject();

    // Parse JSON fields from formData
    const jsonFields = ['roomTypes', 'amenities', 'nearbyPlaces', 'visitingHours', 'galleryImages'];
    jsonFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try { req.body[field] = JSON.parse(req.body[field]); } catch (e) { }
      }
    });

    let filesToDelete = [];

    // Handle files
    if (req.files) {
      if (req.files.coverImage) {
        if (property.coverImage) filesToDelete.push(property.coverImage);
        req.body.coverImage = `uploads/properties/${req.files.coverImage[0].filename}`;
      }
      if (req.files.galleryImages) {
        let galleryTags = [];
        if (req.body.galleryTags) {
          try { galleryTags = JSON.parse(req.body.galleryTags); } catch (e) {}
        }
        
        const newGallery = req.files.galleryImages.map((file, index) => ({
          url: `uploads/properties/${file.filename}`,
          tag: galleryTags[index] || ''
        }));
        
        req.body.galleryImages = [...(req.body.galleryImages || []), ...newGallery];
      }
      if (req.files.roomImages && req.body.roomTypes) {
        let fileIndex = 0;
        req.body.roomTypes.forEach(rt => {
          if (rt.hasNewImage && fileIndex < req.files.roomImages.length) {
            // Delete old image if it exists
            if (rt.image) filesToDelete.push(rt.image);
            rt.image = `uploads/properties/${req.files.roomImages[fileIndex].filename}`;
            fileIndex++;
          }
          delete rt.hasNewImage;
        });
      }
    }

    // Delete removed gallery images
    if (req.body.galleryImages) {
      const retainedUrls = req.body.galleryImages.map(g => g.url);
      property.galleryImages.forEach(g => {
        if (!retainedUrls.includes(g.url)) {
          filesToDelete.push(g.url);
        }
      });
    }
    
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

    // Handle Admin Approval
    if (before.status !== 'approved' && property.status === 'approved') {
      // Broadcast to all connected clients (e.g., public users)
      broadcastEvent(req, 'property_approved', property);
      
      if (property.owner) {
        const Notification = require('../models/Notification');
        const newNotif = await Notification.create({
          user: property.owner,
          message: `Your property "${property.pgName}" has been approved and is now live!`,
          type: 'property',
          relatedId: property._id
        });
        
        sendEventToUser(req, property.owner, 'new_notification', newNotif);
        sendEventToUser(req, property.owner, 'property_status_updated', property);
      }
    }

    // Only notify admins if the property requires approval
    if (property.status === 'pending' && req.user.role !== 'admin') {
      await notifyAdmins(req, `Property "${property.pgName}" was edited and requires re-approval.`, 'property', property._id);
    }

    // Actually delete the files from disk
    if (filesToDelete.length > 0) {
      deleteFiles(filesToDelete);
    }

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
    
    let filesToDelete = [];
    if (property.coverImage) filesToDelete.push(property.coverImage);
    if (property.galleryImages && property.galleryImages.length > 0) {
      property.galleryImages.forEach(g => filesToDelete.push(g.url));
    }
    if (property.roomTypes && property.roomTypes.length > 0) {
      property.roomTypes.forEach(rt => {
        if (rt.image) filesToDelete.push(rt.image);
      });
    }

    await property.deleteOne();

    if (filesToDelete.length > 0) {
      deleteFiles(filesToDelete);
    }

    // Delete related data
    try {
      const Review = require('../models/Review');
      const Lead = require('../models/Lead');
      const Notification = require('../models/Notification');
      const ActivityLog = require('../models/ActivityLog');
      
      await Review.deleteMany({ property: property._id });
      await Lead.deleteMany({ property: property._id });
      await Notification.deleteMany({ type: 'property', relatedId: property._id });
      await ActivityLog.deleteMany({ targetModel: 'Property', targetId: property._id });
    } catch (e) {
      console.error('Error deleting related data for property:', e);
    }

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

// @desc    Increment property views/clicks
// @route   PUT /api/v1/properties/:id/click
// @access  Public
exports.incrementPropertyViews = async (req, res, next) => {
  try {
    const idOrSlug = req.params.id;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const property = await Property.findOneAndUpdate(
      query,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner) {
      sendEventToUser(req, property.owner, 'property_viewed', {
        propertyId: property._id,
        views: property.views
      });
    }

    res.status(200).json({ success: true, data: { views: property.views } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
