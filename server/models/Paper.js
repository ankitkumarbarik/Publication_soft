const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  abstract: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'PUBLISHED', 'REJECTED'],
    default: 'SUBMITTED'
  },
  reviewRemark: {
    type: String,
    default: ''
  },
  reviewRecommendation: {
    type: String,
    enum: ['APPROVE', 'REJECT', ''],
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Paper', paperSchema);
