const mongoose = require('mongoose');

const PropertyClickSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Index for faster aggregation queries
  }
});

module.exports = mongoose.model('PropertyClick', PropertyClickSchema);
