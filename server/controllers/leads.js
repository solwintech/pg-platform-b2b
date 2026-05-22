const Lead = require('../models/Lead');
const Property = require('../models/Property');
const logActivity = require('../utils/logger');

// @desc    Create a new lead
// @route   POST /api/v1/leads
// @access  Public
exports.createLead = async (req, res, next) => {
  try {
    const { propertyId, name, email, phone, type, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const leadData = {
      property: propertyId,
      owner: property.owner,
      name,
      email,
      phone,
      type: type || 'Enquiry',
      message
    };

    // If user is logged in, link to user
    if (req.user) {
      leadData.user = req.user.id;
    }

    const lead = await Lead.create(leadData);

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get leads for property owner
// @route   GET /api/v1/leads
// @access  Private (B2B/Admin)
exports.getLeads = async (req, res, next) => {
  try {
    let query;

    // If admin, get all leads, otherwise only get leads for owner's properties
    if (req.user.role === 'admin') {
      query = Lead.find();
    } else {
      query = Lead.find({ owner: req.user.id });
    }

    // Populate property and user details
    query = query.populate('property', 'pgName city area').populate('user', 'name email phone');

    // Sorting
    query = query.sort('-createdAt');

    const leads = await query;

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update lead status
// @route   PUT /api/v1/leads/:id/status
// @access  Private (B2B/Admin)
exports.updateLeadStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Check if owner
    if (lead.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this lead' });
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, { status, notes }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
