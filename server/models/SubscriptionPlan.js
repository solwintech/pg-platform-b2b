const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a plan name'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['monthly', 'yearly', 'quarterly'],
    default: 'monthly'
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  originalPrice: {
    type: Number
  },
  discount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  features: [String],
  propertyLimit: {
    type: Number,
    default: 5 // -1 for unlimited
  },
  roomLimit: {
    type: Number,
    default: 50
  },
  leadLimit: {
    type: Number,
    default: 100
  },
  supportLevel: {
    type: String,
    enum: ['basic', 'priority', 'premium'],
    default: 'basic'
  },
  featuredListing: {
    type: Boolean,
    default: false
  },
  analytics: {
    type: Boolean,
    default: false
  },
  managerAccess: {
    type: Boolean,
    default: false
  },
  prioritySupport: {
    type: Boolean,
    default: false
  },
  customDomain: {
    type: Boolean,
    default: false
  },
  apiAccess: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  popular: {
    type: Boolean,
    default: false
  },
  description: {
    type: String
  },
  validFor: {
    type: Number,
    default: 30 // days
  },
  color: {
    type: String,
    default: '#4361ee'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
