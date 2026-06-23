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
  views: {
    type: Number,
    default: 0
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
  floorNumber: String,
  totalFloors: mongoose.Schema.Types.Mixed,
  
  // Amenities & Config
  roomTypes: [Object], // Store array of room type objects
  amenities: [String],
  houseRules: [String],
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
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
});

// Update the updatedAt field on save and generate slug
propertySchema.pre('save', async function() {
  this.updatedAt = Date.now();

  if (this.isModified('pgName') || this.isModified('city') || !this.slug) {
    let baseSlug = `${this.pgName || 'property'} ${this.city || ''}`.trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
      
    if (!baseSlug) baseSlug = 'property';
    
    let uniqueSlug = baseSlug;
    let count = 1;
    const PropertyModel = mongoose.models.Property || this.constructor;
    
    while (true) {
      const existing = await PropertyModel.findOne({ slug: uniqueSlug, _id: { $ne: this._id } });
      if (!existing) break;
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }
    
    this.slug = uniqueSlug;
  }
});

module.exports = mongoose.model('Property', propertySchema);
