const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  actorRole: {
    type: String,
    required: true
  },
  action: { 
    type: String, 
    required: true 
  },
  entityType: {
    type: String,
    enum: ['Employee', 'Leave', 'Payroll', 'User', 'System'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Stores JSON details like { "oldValue": "A", "newValue": "B" }
    default: {}
  },
  ipAddress: String,
  userAgent: String
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

module.exports = mongoose.model('AuditLog', AuditLogSchema);