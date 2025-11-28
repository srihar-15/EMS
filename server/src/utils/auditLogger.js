
const AuditLog = require('../models/AuditLog');

const logAudit = async (user, action, entityType, entityId, details = {}, metadata = {}) => {
  try {
    if (!user) return; // System actions might not have a user
    
    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      action,
      entityType,
      entityId,
      metadata: { ...details, ...metadata }, // Merge details into metadata
      ipAddress: '127.0.0.1', // Placeholder, would capture req.ip in controller
      userAgent: 'Nexus-Client/1.0'
    });
    console.log(`[AUDIT] ${user.email} performed ${action} on ${entityType}`);
  } catch (error) {
    console.error('Audit Logging Failed:', error);
    // Don't crash the request if logging fails, but alert admin in real app
  }
};

module.exports = logAudit;
