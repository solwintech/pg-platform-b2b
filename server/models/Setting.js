const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  // General Settings
  siteName: { type: String, default: 'Sortify Stays' },
  siteTagline: { type: String, default: "India's largest PG & Hostel discovery platform" },
  siteEmail: { type: String, default: 'info@sortifystays.com' },
  sitePhone: { type: String, default: '+91 98765 43210' },
  siteAddress: { type: String, default: 'Bangalore, Karnataka, India' },
  
  // Images
  siteLogo: { type: String, default: '' },
  favicon: { type: String, default: '' },

  // Social Links
  socialLinks: {
    facebook: { type: String, default: 'https://facebook.com/sortifystays' },
    twitter: { type: String, default: 'https://twitter.com/sortifystays' },
    instagram: { type: String, default: 'https://instagram.com/sortifystays' },
    linkedin: { type: String, default: 'https://linkedin.com/company/sortifystays' },
    youtube: { type: String, default: 'https://youtube.com/sortifystays' }
  },

  // Homepage Config
  homepageSections: {
    heroTitle: { type: String, default: 'Find Your Perfect PG/Hostel' },
    heroSubtitle: { type: String, default: 'Discover thousands of PGs, hostels, Home Stays and Service Apartments near you' },
    showFeatured: { type: Boolean, default: true },
    showCities: { type: Boolean, default: true },
    showTestimonials: { type: Boolean, default: true },
    showHowItWorks: { type: Boolean, default: true }
  },

  // Legal Pages
  legalPages: {
    terms: { type: String, default: 'Terms and conditions content here...' },
    privacy: { type: String, default: 'Privacy policy content here...' },
    refund: { type: String, default: 'Refund policy content here...' },
    about: { type: String, default: 'About us content here...' },
    contact: { type: String, default: 'Contact us content here...' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
