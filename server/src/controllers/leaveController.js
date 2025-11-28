
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');
const logAudit = require('../utils/auditLogger');
const notify = require('../utils/notifier');

// @desc    Create new leave request
// @route   POST /api/leaves
const applyLeave = async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  const employeeId = req.user.employeeId;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (days <= 0) {
    return res.status(400).json({ message: 'Invalid date range' });
  }

  // 1. Check Balance
  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

  const currentBalance = employee.leaveBalance[type];
  if (currentBalance < days) {
    return res.status(400).json({ 
      message: `Insufficient leave balance. Available: ${currentBalance}, Requested: ${days}` 
    });
  }

  // 2. Create Request
  const leave = await Leave.create({
    employee: employeeId,
    type,
    startDate,
    endDate,
    days,
    reason,
    status: 'Pending',
    level: days > 3 ? 'L2' : 'L1' // Mark level requirement
  });

  // 3. Notify HR
  const hrUsers = await User.find({ role: 'HR' });
  hrUsers.forEach(hr => {
    notify(hr._id, 'info', `New ${type} leave request from ${employee.name}`);
  });

  await logAudit(req.user, 'CREATE', 'Leave', leave._id, { type, days });

  res.status(201).json(leave);
};

// @desc    Get all leaves (with filters)
// @route   GET /api/leaves
const getLeaves = async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword ? {
    status: req.query.keyword
  } : {};

  // Employees see only their own, Admin/HR see all
  const filter = req.user.role === 'EMPLOYEE' 
    ? { employee: req.user.employeeId, ...keyword } 
    : { ...keyword };

  const count = await Leave.countDocuments(filter);
  const leaves = await Leave.find(filter)
    .populate('employee', 'name department')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ leaves, page, pages: Math.ceil(count / pageSize) });
};

// @desc    Approve Leave (L1 - HR)
// @route   PATCH /api/leaves/:id/approve-l1
const approveL1 = async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate('employee');

  if (!leave) return res.status(404).json({ message: 'Leave not found' });
  if (leave.status !== 'Pending') return res.status(400).json({ message: 'Leave is not pending' });

  // WORKFLOW LOGIC
  if (leave.days > 3) {
    // Escalate to L2
    leave.status = 'L1_Approved';
    leave.approvedBy = req.user._id; // HR ID
    await leave.save();
    
    // Notify Admins
    const admins = await User.find({ role: 'ADMIN' });
    admins.forEach(admin => {
        notify(admin._id, 'warning', `Escalated Leave Approval Required: ${leave.employee.name} (${leave.days} days)`);
    });
    
    await logAudit(req.user, 'APPROVE_L1', 'Leave', leave._id, { status: 'L1_Approved' });
    res.json(leave);
  } else {
    // Final Approval (<= 3 days)
    await finalizeApproval(leave, req.user);
    res.json(leave);
  }
};

// @desc    Approve Leave (L2 - Admin)
// @route   PATCH /api/leaves/:id/approve-l2
const approveL2 = async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate('employee');

  if (!leave) return res.status(404).json({ message: 'Leave not found' });
  if (leave.status !== 'L1_Approved') return res.status(400).json({ message: 'Leave needs L1 approval first or is already processed' });

  await finalizeApproval(leave, req.user);
  res.json(leave);
};

// Helper: Finalize and Deduct
const finalizeApproval = async (leave, approver) => {
  const employee = await Employee.findById(leave.employee._id);
  
  // Double check balance just in case
  if (employee.leaveBalance[leave.type] < leave.days) {
    throw new Error('Balance mismatch during final approval');
  }

  // Deduct Balance
  employee.leaveBalance[leave.type] -= leave.days;
  await employee.save();

  leave.status = 'L2_Approved'; // 'L2_Approved' serves as "Fully Approved" in our schema
  leave.approvedBy = approver._id;
  await leave.save();

  // Notify Employee
  const empUser = await User.findOne({ employeeId: employee._id });
  if (empUser) notify(empUser._id, 'success', `Your leave for ${leave.startDate} has been APPROVED.`);
  
  await logAudit(approver, 'APPROVE_FINAL', 'Leave', leave._id, { days: leave.days, deducted: true });
};

// @desc    Reject Leave
// @route   PATCH /api/leaves/:id/reject
const rejectLeave = async (req, res) => {
  const { reason } = req.body;
  const leave = await Leave.findById(req.params.id).populate('employee');

  if (!leave) return res.status(404).json({ message: 'Leave not found' });

  leave.status = 'Rejected';
  leave.rejectedBy = req.user._id;
  leave.rejectionReason = reason || 'Operational requirements';
  await leave.save();

  const empUser = await User.findOne({ employeeId: leave.employee._id });
  if (empUser) notify(empUser._id, 'error', `Your leave request was REJECTED: ${leave.rejectionReason}`);

  await logAudit(req.user, 'REJECT', 'Leave', leave._id, { reason });
  res.json(leave);
};

module.exports = { applyLeave, getLeaves, approveL1, approveL2, rejectLeave };
