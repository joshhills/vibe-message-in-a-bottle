const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, required: true },
  bottleStyle: { type: Number, required: true, min: 1, max: 5, default: 1 },
  createdAt: { type: Date, default: Date.now },
  readBy: [{ type: String }],
  sessionId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  ipAddress: { type: String, required: true, select: false } // stored but not returned in queries
});

// Index for efficient queries
messageSchema.index({ sessionId: 1 });
messageSchema.index({ status: 1 });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema); 