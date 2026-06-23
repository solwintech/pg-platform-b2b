const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  subtitle: {
    type: String
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  link: {
    type: String
  },
  location: {
    type: String,
    enum: [
      'home_hero',
      'home_mid',
      'listing_sidebar',
      'listing_bottom',
      'property_sidebar',
      'listing_sidebar_1',
      'listing_sidebar_2'
    ],
    default: 'home_hero'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  priority: {
    type: Number,
    default: 1
  },
  clicks: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Advertisement', AdvertisementSchema);
