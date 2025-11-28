
const AuditLog = require('../models/AuditLog');

// @desc    Get Logs
// @route   GET /api/audit
const getLogs = async (req, res) => {
  const pageSize = 50;
  const page = Number(req.query.pageNumber) || 1;

  const logs = await AuditLog.find({})
    .populate('actor', 'email')
    .sort({ timestamp: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json(logs);
};

module.exports = { getLogs };
