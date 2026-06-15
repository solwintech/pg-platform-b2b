const Review = require('../models/Review');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const notifyAdmins = require('../utils/notifyAdmins');
const { broadcastEvent, sendEventToUser } = require('../utils/sse');
// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    let query;

    // If a propertyId is provided, filter by that property
    if (req.params.propertyId) {
      const idOrSlug = req.params.propertyId;
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
      let propId = idOrSlug;
      
      if (!isObjectId) {
        const prop = await Property.findOne({ slug: idOrSlug }).select('_id');
        if (!prop) {
          return res.status(404).json({ success: false, message: 'Property not found' });
        }
        propId = prop._id;
      }
      
      query = Review.find({ property: propId, status: 'approved' });
    } else if (req.user && req.user.role === 'admin') {
      // Admins see all reviews
      query = Review.find();
    } else {
      // General public only sees approved reviews
      query = Review.find({ status: 'approved' });
    }

    const reviews = await query
      .populate({
        path: 'property',
        select: 'pgName owner'
      })
      .populate({
        path: 'user',
        select: 'name email profileImage'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: 'property',
      select: 'pgName'
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add review
// @route   POST /api/v1/properties/:propertyId/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const idOrSlug = req.params.propertyId;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    
    const property = await Property.findOne(query);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    req.body.property = property._id;
    req.body.user = req.user.id;
    req.body.status = 'pending';

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const review = await Review.create(req.body);

    // Notify all admins about the new review
    await notifyAdmins(req, `A new review was added for ${property.pgName}`, 'review', review._id);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this property' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update review' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete review' });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update review status (Admin only)
// @route   PUT /api/v1/reviews/:id/status
// @access  Private/Admin
exports.updateReviewStatus = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id).populate('property').populate('user', 'name profileImage');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const previousStatus = review.status;
    review.status = req.body.status;
    await review.save();

    // If status is changed to approved, notify the B2B owner
    if (req.body.status === 'approved' && previousStatus !== 'approved' && review.property && review.property.owner) {
      const newNotif = await Notification.create({
        user: review.property.owner,
        message: `A review for ${review.property.pgName} has been approved and is now public.`,
        type: 'review',
        relatedId: review._id
      });
      broadcastEvent(req, 'review_approved', review);
      sendEventToUser(req, review.property.owner, 'new_notification', newNotif);
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add reply to review (Admin or Property Owner)
// @route   PUT /api/v1/reviews/:id/reply
// @access  Private
exports.addReviewReply = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id).populate('property');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check authorization: Admin or Property Owner
    if (req.user.role !== 'admin' && review.property.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to reply to this review' });
    }

    review.reply = req.body.reply;
    review.replyAt = Date.now();
    await review.save();

    const fullyPopulatedReview = await Review.findById(review._id).populate('user', 'name profileImage').populate('property');
    broadcastEvent(req, 'review_replied', fullyPopulatedReview);

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
