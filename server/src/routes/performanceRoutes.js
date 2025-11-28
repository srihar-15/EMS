
const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('ADMIN', 'HR'), createReview);
router.get('/employee/:id', protect, getReviews);

module.exports = router;
