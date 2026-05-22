const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  pgName: {
    type: String,
    required: [true, 'Please add a property name'],
    trim: true
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['PG', 'Hostel', 'Home Stay', 'Service Apartment']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Basic Info
  managerName: String,
  managerPhone: String,
  managerEmail: String,
  postedBy: String,
  postedByName: String,
  
  // Location
  address: String,
  area: String,
  city: String,
  pinCode: String,
  latitude: Number,
  longitude: Number,
  
  // Details
  genderAllowed: String,
  totalBeds: Number,
  totalRooms: Number,
  floorNumber: Number,
  totalFloors: Number,
  
  // Amenities & Config
  roomTypes: [Object], // Store array of room type objects
  amenities: [String],
  nearbyPlaces: [Object],
  
  // Pricing
  depositType: String,
  deposit: String,
  paymentCycle: String,
  minLocking: String,
  maintenance: String,
  electricityCharges: String,
  foodOption: String,
  
  // Media
  coverImage: String,
  galleryImages: [Object],

  // Visiting Availability
  visitingHours: {
    availableDays: [String],
    startTime: String,
    endTime: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isReapproval: {
    type: Boolean,
    default: false
  },
  changedFields: [String],
  previousValues: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

// Update the updatedAt field on save
propertySchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Property', propertySchema);
