
const Attendance = require('../models/Attendance');
const logAudit = require('../utils/auditLogger');

// @desc    Check In
// @route   POST /api/attendance/checkin
const checkIn = async (req, res) => {
  const employeeId = req.user.employeeId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already checked in
  const existing = await Attendance.findOne({ 
    employee: employeeId, 
    date: { $gte: today } 
  });

  if (existing) {
    return res.status(400).json({ message: 'Already checked in today' });
  }

  const now = new Date();
  // Simple Logic: If after 9:30 AM, mark late
  const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

  const attendance = await Attendance.create({
    employee: employeeId,
    date: now,
    checkIn: now,
    status: isLate ? 'Late' : 'On-time'
  });

  await logAudit(req.user, 'CHECK_IN', 'Attendance', attendance._id, { time: now });

  res.status(201).json(attendance);
};

// @desc    Check Out
// @route   POST /api/attendance/checkout
const checkOut = async (req, res) => {
  const employeeId = req.user.employeeId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({ 
    employee: employeeId, 
    date: { $gte: today } 
  });

  if (!attendance) {
    return res.status(404).json({ message: 'No check-in record found for today' });
  }
  
  if (attendance.checkOut) {
    return res.status(400).json({ message: 'Already checked out' });
  }

  const now = new Date();
  const hours = (now - attendance.checkIn) / (1000 * 60 * 60);

  attendance.checkOut = now;
  attendance.totalHours = parseFloat(hours.toFixed(2));
  
  if (attendance.totalHours < 4) attendance.status = 'Half-day'; // Logic update
  
  await attendance.save();

  await logAudit(req.user, 'CHECK_OUT', 'Attendance', attendance._id, { hours: attendance.totalHours });

  res.json(attendance);
};

// @desc    Get My Attendance
// @route   GET /api/attendance/my
const getMyAttendance = async (req, res) => {
  const records = await Attendance.find({ employee: req.user.employeeId }).sort({ date: -1 }).limit(30);
  res.json(records);
};

// @desc    Get Employee Attendance (Admin/HR)
// @route   GET /api/attendance/employee/:id
const getEmployeeAttendance = async (req, res) => {
  const records = await Attendance.find({ employee: req.params.id }).sort({ date: -1 });
  res.json(records);
};

module.exports = { checkIn, checkOut, getMyAttendance, getEmployeeAttendance };
