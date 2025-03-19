const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 500
  },
  author: {
    type: String,
    default: 'Anonymous',
    maxLength: 50
  },
  sessionId: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  bottleStyle: {
    type: Number,
    min: 1,
    max: 8,
    required: true
  },
  font: {
    type: Number,
    enum: [1, 2, 3, 4], // 1: Georgia (serif), 2: Roboto (sans-serif), 3: JetBrains Mono (monospace), 4: Indie Flower (handwriting)
    default: 1
  },
  sketch: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5], // 0: None, 1: Heart, 2: Creature, 3: Sword, 4: Balloon, 5: Star
    default: 0
  },
  readBy: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
messageSchema.index({ sessionId: 1 });
messageSchema.index({ status: 1 });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema); 