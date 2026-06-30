const mongoose = require('mongoose');
const crypto = require('crypto');

const LeadSchema = new mongoose.Schema({
  leadId: {
    type: String,
    unique: true
  },
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    required: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  type: {
    type: String,
    enum: ['Enquiry', 'Contact', 'WhatsApp'],
    default: 'Enquiry'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Closed', 'Spam'],
    default: 'New'
  },
  message: {
    type: String
  },
  notes: {
    type: String
  },
  enquiryFor: {
    type: String
  },
  moveInDate: {
    type: String
  },
  visitDate: {
    type: String
  },
  visitTime: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

LeadSchema.pre('save', function() {
  if (!this.leadId) {
    this.leadId = 'LID-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
});

module.exports = mongoose.model('Lead', LeadSchema);
