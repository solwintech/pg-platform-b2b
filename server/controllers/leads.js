const Lead = require('../models/Lead');
const Property = require('../models/Property');
const PropertyClick = require('../models/PropertyClick');
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

    // Determine the recipients
    const adminEmails = ['sales@sortifystays.com', 'contact@sortifystays.com'];
    let recipients = [...adminEmails];

    // Fetch the property owner's email
    let ownerUser = null;
    try {
      const User = require('../models/User');
      ownerUser = await User.findById(property.owner);
      if (ownerUser && ownerUser.email) {
        recipients.push(ownerUser.email);
      } else {
        console.log('Owner user not found or has no email:', property.owner);
      }
    } catch (e) {
      console.error('Could not fetch owner email for leads', e);
    }

    if (property.managerEmail && !recipients.includes(property.managerEmail)) {
      recipients.push(property.managerEmail);
    }

    console.log('Final email recipients list:', recipients);

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
        email: recipients.join(', '),
        subject: emailSubject,
        message: emailMessage,
      });
    } catch (err) {
      console.error('Email could not be sent to admins/owners', err);
    }

    // --- Send Email to User (Lead) ---
    if (email) {
      try {
        const userSubject = `Thank You for Your Enquiry – ${property.pgName || 'Property'} | ${new Date().toLocaleDateString()}`;
        const userMessage = `Dear ${name || 'Customer'},

Thank you for showing interest in ${property.pgName || 'our property'}.

We have successfully received your enquiry on ${new Date().toLocaleDateString()} and shared it with the respective property manager. You may contact them directly using the details below to check room availability and other details.

Property Details
🏠 Property Name: ${property.pgName || 'N/A'}
📍 Address: ${property.address || property.area || 'N/A'}
🏙️ City: ${property.city || 'N/A'}

Property Manager Details
👤 Name: ${property.managerName || (ownerUser ? ownerUser.name : 'Property Manager')}
📞 Mobile: ${property.managerPhone || (ownerUser ? ownerUser.phone : 'N/A')}
✉️ Email: ${property.managerEmail || (ownerUser ? ownerUser.email : 'N/A')}

What's Next?
- Contact the property manager directly for the fastest response.
- Discuss room availability and move-in dates.
- Visit the property before booking.

If you need any assistance, our support team is always happy to help.

Thank you for choosing Sortify Stays.

Warm Regards,
Team Sortify Stays
🌐 https://sortifystays.com 
📧 support@sortifystays.com`;

        await sendEmail({
          email: email,
          subject: userSubject,
          message: userMessage,
        });
      } catch (err) {
        console.error('Email could not be sent to user', err);
      }
    }

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (err) {
    console.error('Lead error:', err);
    res.status(400).json({ success: false, message: err.message, stack: err.stack });
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

// @desc    Get B2B Analytics (Leads & Clicks)
// @route   GET /api/v1/leads/analytics
// @access  Private/Owner
exports.getAnalytics = async (req, res, next) => {
  try {
    const { timeframe, viewType = 'date' } = req.query; // timeframe: 'day', 'month', 'year'. viewType: 'date', 'property'
    const ownerId = req.user._id || req.user.id;
    
    // Determine the date filter based on timeframe if viewType is 'property'
    let dateFilter = { owner: ownerId };
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
      dateFilter.createdAt = { $gte: startDate };
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
      // Group by property
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
        if(item._id) statsMap[item._id.toString()] = { propertyId: item._id, leads: item.leads, clicks: 0 };
      });
      clickStats.forEach(item => {
        if(item._id) {
          if (statsMap[item._id.toString()]) {
            statsMap[item._id.toString()].clicks = item.clicks;
          } else {
            statsMap[item._id.toString()] = { propertyId: item._id, leads: 0, clicks: item.clicks };
          }
        }
      });

      // Populate property details
      let data = Object.values(statsMap);
      const Property = require('../models/Property');
      const properties = await Property.find({ _id: { $in: data.map(d => d.propertyId) } }).select('pgName city');
      
      data = data.map(d => {
        const p = properties.find(prop => prop._id.toString() === d.propertyId.toString());
        return {
          ...d,
          propertyName: p ? p.pgName : 'Unknown Property',
          city: p ? p.city : ''
        };
      }).sort((a, b) => b.clicks - a.clicks);

      return res.status(200).json({ success: true, data });
    }

    // Group by Date
    const leadStats = await Lead.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          leads: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const clickStats = await PropertyClick.aggregate([
      { $match: { owner: ownerId } },
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
