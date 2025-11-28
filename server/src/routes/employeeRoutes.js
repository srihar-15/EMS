
const express = require('express');
const router = express.Router();
const { 
  getEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('ADMIN', 'HR'), getEmployees)
  .post(protect, authorize('ADMIN'), createEmployee);

router.route('/:id')
  .get(protect, authorize('ADMIN', 'HR'), getEmployeeById)
  .patch(protect, authorize('ADMIN', 'HR'), updateEmployee) // PATCH is better for partial updates
  .delete(protect, authorize('ADMIN'), deleteEmployee);

module.exports = router;
