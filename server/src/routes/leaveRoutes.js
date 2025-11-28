
const express = require('express');
const router = express.Router();
const { 
  applyLeave, 
  getLeaves, 
  approveL1, 
  approveL2, 
  rejectLeave 
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, applyLeave)
  .get(protect, getLeaves);

router.patch('/:id/approve-l1', protect, authorize('HR'), approveL1);
router.patch('/:id/approve-l2', protect, authorize('ADMIN'), approveL2);
router.patch('/:id/reject', protect, authorize('HR', 'ADMIN'), rejectLeave);

module.exports = router;
