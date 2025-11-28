
const PerformanceReview = require('../models/PerformanceReview');
const notify = require('../utils/notifier');
const logAudit = require('../utils/auditLogger');
const User = require('../models/User');

// @desc    Create Review
// @route   POST /api/performance
const createReview = async (req, res) => {
  const { employeeId, rating, comments, goals, period } = req.body;

  const review = await PerformanceReview.create({
    employee: employeeId,
    reviewer: req.user._id,
    rating,
    comments,
    goals, // Array of objects
    period
  });

  const empUser = await User.findOne({ employeeId });
  if (empUser) notify(empUser._id, 'info', 'You have received a new performance review.');

  await logAudit(req.user, 'CREATE_REVIEW', 'PerformanceReview', review._id, { rating, period });

  res.status(201).json(review);
};

// @desc    Get Reviews for Employee
// @route   GET /api/performance/employee/:id
const getReviews = async (req, res) => {
  // Access check: User must be Admin, HR, or the employee themselves
  if (req.user.role === 'EMPLOYEE' && req.user.employeeId.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Not authorized to view these reviews' });
  }

  const reviews = await PerformanceReview.find({ employee: req.params.id })
    .populate('reviewer', 'email role')
    .sort({ createdAt: -1 });

  res.json(reviews);
};

module.exports = { createReview, getReviews };
