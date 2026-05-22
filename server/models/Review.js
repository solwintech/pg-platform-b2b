const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Please add a title for the review'],
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  reply: {
    type: String
  },
  replyAt: {
    type: Date
  },
  tags: [String],
  isVerified: {
    type: Boolean,
    default: false
  },
  reportedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per property
ReviewSchema.index({ property: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
