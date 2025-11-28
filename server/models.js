const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ['ADMIN', 'HR', 'EMPLOYEE'] },
  department: String,
  salary: Number,
  joinDate: String,
  avatar: String,
  leaveBalance: {
    vacation: Number,
    sick: Number,
    personal: Number
  }
});

const LeaveRequestSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  type: String,
  startDate: String,
  endDate: String,
  reason: String,
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'PENDING_ADMIN'] }
});

const AuditLogSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userRole: String,
  action: String,
  target: String,
  timestamp: String,
  details: String
});

const PerformanceReviewSchema = new mongoose.Schema({
  employeeId: String,
  reviewerId: String,
  reviewerName: String,
  rating: Number,
  feedback: String,
  goals: [String],
  date: String
});

const AttendanceRecordSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  date: String,
  checkIn: String,
  checkOut: String,
  status: String,
  totalHours: Number
});

const DepartmentBudgetSchema = new mongoose.Schema({
  department: String,
  allocated: Number,
  year: Number
});

const NotificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  type: String,
  isRead: Boolean,
  timestamp: String
});

module.exports = {
  Employee: mongoose.model('Employee', EmployeeSchema),
  LeaveRequest: mongoose.model('LeaveRequest', LeaveRequestSchema),
  AuditLog: mongoose.model('AuditLog', AuditLogSchema),
  PerformanceReview: mongoose.model('PerformanceReview', PerformanceReviewSchema),
  AttendanceRecord: mongoose.model('AttendanceRecord', AttendanceRecordSchema),
  DepartmentBudget: mongoose.model('DepartmentBudget', DepartmentBudgetSchema),
  Notification: mongoose.model('Notification', NotificationSchema)
};