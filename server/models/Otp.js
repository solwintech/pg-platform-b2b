const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto-delete document after 10 minutes (600 seconds)
  }
});

// Index to automatically delete expired OTPs (backup to the 'expires' option above)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
