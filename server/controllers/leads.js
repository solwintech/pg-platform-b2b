const Lead = require('../models/Lead');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/logger');

// @desc    Create a new lead
// @route   POST /api/v1/leads
// @access  Public
exports.createLead = async (req, res, next) => {
  try {
    const { propertyId, name, email, phone, type, actionType, message, enquiryMessage, visitDate, visitTime, enquiryFor, moveInDate } = req.body;
    const finalMessage = message || enquiryMessage;
    
    // Map to allowed enums: ['Enquiry', 'Contact', 'WhatsApp']
    
    let finalType = 'Enquiry';
    const inputType = (type || actionType || '').toLowerCase();
    
    if (inputType === 'contact') {
      finalType = 'Contact';
    } else if (inputType === 'whatsapp') {
      finalType = 'WhatsApp';
    } else if (type) {
      // In case another valid enum was passed directly
      finalType = type;
    }

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
      type: finalType,
      message: finalMessage,
      enquiryFor,
      moveInDate,
      visitDate,
      visitTime
    };

    // If user is logged in, link to user
    if (req.user) {
      leadData.user = req.user.id;
    }

    const lead = await Lead.create(leadData);

    // Create a notification for the property owner
    if (property.owner) {
      const newNotif = await Notification.create({
        user: property.owner,
        message: `New ${type || 'Enquiry'} from ${name} for ${property.pgName}`,
        type: 'lead',
        relatedId: lead._id
      });
      
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      if (io && connectedUsers) {
        const ownerSocketId = connectedUsers.get(property.owner.toString());
        if (ownerSocketId) {
          io.to(ownerSocketId).emit('new_notification', newNotif);
        }
      }
    }

    // Send email to the manager if managerEmail is provided
    if (property.managerEmail) {
      let emailMessage = '';
      let emailSubject = '';

      if (finalType === 'Contact') {
        emailSubject = `New Contact Request for ${property.pgName}`;
        emailMessage = `Hello Team,

A prospective lead has requested to be contacted regarding ${property.pgName}.

Contact Details:
- Name: ${name || 'N/A'}
- Phone: ${phone || 'N/A'}
- Email: ${email || 'N/A'}
- Date & Time: ${new Date().toLocaleString()}

Message:
"${finalMessage || 'Please contact me regarding this property.'}"

Please reach out to the customer soon.

Best regards,
Sorting Stays`;
      } else {
        emailSubject = `New Lead Generated: ${property.pgName}`;
        emailMessage = `Hello Team,

A new inquiry has been received through Sorting Stays.

Inquiry Details

- Name: ${name || 'N/A'}
- Email: ${email || 'N/A'}
- Phone: ${phone || 'N/A'}
- Property Type Interested In: ${property.pgName || 'N/A'}
- Preferred Location: ${property.city ? property.city + (property.area ? ', ' + property.area : '') : 'N/A'}
- Budget Range: ${property.minPrice ? `₹${property.minPrice}` : 'N/A'}${property.maxPrice ? ` - ₹${property.maxPrice}` : ''}
- Move-in Date: ${moveInDate ? new Date(moveInDate).toLocaleDateString() : 'N/A'}
- Inquiry Date & Time: ${new Date().toLocaleString()}
- Source: Web Platform

Customer Message
${finalMessage || 'No message provided'}

Please review the inquiry and reach out to the customer at the earliest.

Regards,
Sorting Stays`;
      }

      try {
        await sendEmail({
          email: property.managerEmail,
          subject: emailSubject,
          message: emailMessage,
        });
      } catch (err) {
        console.error('Email could not be sent', err);
      }
    }

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
