const Property = require('../models/Property');
const User = require('../models/User');
const Lead = require('../models/Lead');
const PropertyClick = require('../models/PropertyClick');
const ActivityLog = require('../models/ActivityLog');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const logActivity = require('../utils/logger');
const { sendPropertyApprovedSms } = require('../utils/sms');

// @desc    Update property status (Approve/Reject)
// @route   PUT /api/v1/admin/properties/:id/status
// @access  Private/Admin
exports.updatePropertyStatus = async (req, res, next) => {
  try {
    const { status, isFeatured } = req.body;

    if (status && !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let property = await Property.findById(req.params.id).populate('owner');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const before = property.toObject();

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (isFeatured !== undefined) updateFields.isFeatured = isFeatured;
    
    if (status === 'approved') {
      updateFields.isReapproval = false;
      updateFields.changedFields = [];
      updateFields.previousValues = {};

      // Send SMS Notification to Owner
      if (property.owner && property.owner.phone) {
        sendPropertyApprovedSms(property.owner.phone, property.pgName, property.owner.name);
      }
    }

    property = await Property.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    if (status === 'approved' && before.status !== 'approved') {
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      
      if (io) {
        io.emit('property_approved', property);
      }
      
      if (property.owner) {
        const Notification = require('../models/Notification');
        const ownerId = property.owner._id || property.owner;
        const newNotif = await Notification.create({
          user: ownerId,
          message: `Your property "${property.pgName}" has been approved and is now live!`,
          type: 'property',
          relatedId: property._id
        });
        
        if (io && connectedUsers) {
          const ownerSocketId = connectedUsers.get(ownerId.toString());
          if (ownerSocketId) {
            io.to(ownerSocketId).emit('new_notification', newNotif);
            io.to(ownerSocketId).emit('property_status_updated', property);
          }
        }
      }
    }

    res.status(200).json({ success: true, data: property });

    // Log status change
    logActivity({
      action: status === 'approved' ? 'APPROVE_PROPERTY' : 'REJECT_PROPERTY',
      performedBy: req.user.id,
      targetModel: 'Property',
      targetId: property._id,
      before,
      after: property.toObject(),
      details: `Property ${status}: ${property.pgName}`
    }, req);

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all activity logs
// @route   GET /api/v1/admin/logs
// @access  Private/Admin
exports.getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('performedBy', 'name email role')
      .sort('-timestamp')
      .limit(100); // Limit to last 100 logs for performance

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update user status (Active/Inactive)
// @route   PUT /api/v1/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { active } = req.body;

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const before = user.toObject();

    user = await User.findByIdAndUpdate(req.params.id, { active }, {
      new: true
    });

    res.status(200).json({ success: true, data: user });

    // Log status change
    logActivity({
      action: 'UPDATE_USER_STATUS',
      performedBy: req.user.id,
      targetModel: 'User',
      targetId: user._id,
      before,
      after: user.toObject(),
      details: `User ${active ? 'activated' : 'deactivated'}: ${user.email}`
    }, req);

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const pendingProperties = await Property.countDocuments({ status: 'pending' });
    const approvedProperties = await Property.countDocuments({ status: 'approved' });

    // Recent registrations
    const recentProperties = await Property.find()
      .sort('-createdAt')
      .limit(5)
      .select('pgName managerName city status createdAt propertyType');

    const recentUsers = await User.find()
      .sort('-createdAt')
      .limit(5)
      .select('name email role active createdAt');

    // Growth stats (simple version: new this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const newPropertiesThisMonth = await Property.countDocuments({ createdAt: { $gte: startOfMonth } });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        pendingProperties,
        approvedProperties,
        newUsersThisMonth,
        newPropertiesThisMonth,
        recentProperties,
        recentUsers,
        monthlyData: {
          users: [10, 20, 15, 25, 30, totalUsers],
          properties: [5, 10, 8, 12, 15, totalProperties]
        }
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get Admin Analytics (Leads & Clicks)
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const { timeframe, viewType = 'date', propertyId } = req.query; // timeframe: 'day', 'month', 'year'. viewType: 'date', 'property'
    
    // Determine the date filter based on timeframe if viewType is 'property'
    // If viewType is property, we filter by the current day/month/year to show relevant stats.
    let dateFilter = {};
    const now = new Date();
    if (viewType === 'property') {
      let startDate = new Date();
      if (timeframe === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      } else if (timeframe === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        startDate.setHours(0, 0, 0, 0);
      }
      dateFilter = { createdAt: { $gte: startDate } };
    }

    let dateFormat;
    if (timeframe === 'year') {
      dateFormat = "%Y";
    } else if (timeframe === 'month') {
      dateFormat = "%Y-%m";
    } else {
      dateFormat = "%Y-%m-%d"; // default to day
    }

    if (viewType === 'property') {
      // Group by property for the timeframe
      const leadStats = await Lead.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$property",
            leads: { $sum: 1 }
          }
        }
      ]);

      const clickStats = await PropertyClick.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$property",
            clicks: { $sum: 1 }
          }
        }
      ]);

      const statsMap = {};
      leadStats.forEach(item => {
        if(item._id) statsMap[item._id.toString()] = { leads: item.leads, clicks: 0 };
      });
      clickStats.forEach(item => {
        if(item._id) {
          if (statsMap[item._id.toString()]) {
            statsMap[item._id.toString()].clicks = item.clicks;
          } else {
            statsMap[item._id.toString()] = { leads: 0, clicks: item.clicks };
          }
        }
      });

      // Populate property details for ALL properties (so we don't miss ones with 0 activity in the timeframe)
      const Property = require('../models/Property');
      const allProperties = await Property.find({}).select('pgName city views status propertyType');
      
      const data = allProperties.map(p => {
        const propId = p._id.toString();
        const stats = statsMap[propId] || { leads: 0, clicks: 0 };
        return {
          propertyId: propId,
          propertyName: p.pgName,
          city: p.city,
          status: p.status,
          propertyType: p.propertyType,
          historicViews: p.views || 0,
          leads: stats.leads,
          clicks: stats.clicks
        };
      }).sort((a, b) => b.historicViews - a.historicViews);

      return res.status(200).json({ success: true, data });
    }

    // Group by Date
    const dateMatch = {};
    if (propertyId) {
      dateMatch.property = new (require('mongoose').Types.ObjectId)(propertyId);
    }
    
    const leadStats = await Lead.aggregate([
      ...(Object.keys(dateMatch).length > 0 ? [{ $match: dateMatch }] : []),
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          leads: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const clickStats = await PropertyClick.aggregate([
      ...(Object.keys(dateMatch).length > 0 ? [{ $match: dateMatch }] : []),
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Merge stats
    const statsMap = {};
    leadStats.forEach(item => {
      statsMap[item._id] = { date: item._id, leads: item.leads, clicks: 0 };
    });
    clickStats.forEach(item => {
      if (statsMap[item._id]) {
        statsMap[item._id].clicks = item.clicks;
      } else {
        statsMap[item._id] = { date: item._id, leads: 0, clicks: item.clicks };
      }
    });

    const data = Object.values(statsMap).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create a user
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });

    logActivity({
      action: 'CREATE_USER',
      performedBy: req.user.id,
      targetModel: 'User',
      targetId: user._id,
      after: user.toObject(),
      details: `Admin created user: ${user.email}`
    }, req);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update a user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const before = user.toObject();
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: user });

    logActivity({
      action: 'UPDATE_USER',
      performedBy: req.user.id,
      targetModel: 'User',
      targetId: user._id,
      before,
      after: user.toObject(),
      details: `Admin updated user: ${user.email}`
    }, req);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

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

    // If B2B, delete their properties and related data
    if (user.role === 'b2b') {
      const properties = await Property.find({ owner: user._id });
      for (const property of properties) {
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

        // Delete property related data
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
      }
    }

    // Delete user related data
    try {
      const Review = require('../models/Review');
      const Lead = require('../models/Lead');
      const Notification = require('../models/Notification');
      const ActivityLog = require('../models/ActivityLog');

      await Review.deleteMany({ user: user._id });
      await Lead.deleteMany({ user: user._id });
      await Notification.deleteMany({ user: user._id });
      await ActivityLog.deleteMany({ performedBy: user._id });
    } catch (e) {
      console.error('Error deleting user related data:', e);
    }

    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });

    logActivity({
      action: 'DELETE_USER',
      performedBy: req.user.id,
      targetModel: 'User',
      targetId: user._id,
      before: user.toObject(),
      details: `Admin deleted user: ${user.email}`
    }, req);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all subscription plans
// @route   GET /api/v1/admin/plans
// @access  Private/Admin
exports.getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find().sort('price');
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create a subscription plan
// @route   POST /api/v1/admin/plans
// @access  Private/Admin
exports.createSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });

    logActivity({
      action: 'CREATE_PLAN',
      performedBy: req.user.id,
      targetModel: 'SubscriptionPlan',
      targetId: plan._id,
      after: plan.toObject(),
      details: `Admin created subscription plan: ${plan.name}`
    }, req);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update a subscription plan
// @route   PUT /api/v1/admin/plans/:id
// @access  Private/Admin
exports.updateSubscriptionPlan = async (req, res, next) => {
  try {
    let plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const before = plan.toObject();
    plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: plan });

    logActivity({
      action: 'UPDATE_PLAN',
      performedBy: req.user.id,
      targetModel: 'SubscriptionPlan',
      targetId: plan._id,
      before,
      after: plan.toObject(),
      details: `Admin updated subscription plan: ${plan.name}`
    }, req);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete a subscription plan
// @route   DELETE /api/v1/admin/plans/:id
// @access  Private/Admin
exports.deleteSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    await plan.deleteOne();
    res.status(200).json({ success: true, data: {} });

    logActivity({
      action: 'DELETE_PLAN',
      performedBy: req.user.id,
      targetModel: 'SubscriptionPlan',
      targetId: plan._id,
      before: plan.toObject(),
      details: `Admin deleted subscription plan: ${plan.name}`
    }, req);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
