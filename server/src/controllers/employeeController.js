
const Employee = require('../models/Employee');
const User = require('../models/User');
const logAudit = require('../utils/auditLogger');

// @desc    Get all employees
// @route   GET /api/employees
const getEmployees = async (req, res) => {
  const employees = await Employee.find({});
  res.json(employees);
};

// @desc    Get single employee
// @route   GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (employee) {
    res.json(employee);
  } else {
    res.status(404).json({ message: 'Employee not found' });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
const createEmployee = async (req, res) => {
  const { name, email, department, designation, salary, dateOfJoining, role } = req.body;

  const employeeExists = await Employee.findOne({ email });
  if (employeeExists) {
    return res.status(400).json({ message: 'Employee already exists' });
  }

  // 1. Create Employee Profile
  const employee = await Employee.create({
    name,
    email,
    department,
    designation,
    salary,
    dateOfJoining,
    status: 'Active'
  });

  // 2. Create User Login Account
  // In a real app, generate a random password and email it.
  const userAccount = await User.create({
    email,
    passwordHash: 'default123', // MOCK HASH
    role: role || 'EMPLOYEE',
    employeeId: employee._id
  });

  await logAudit(req.user, 'CREATE', 'Employee', employee._id, { name, department });

  res.status(201).json({ employee, user: userAccount });
};

// @desc    Update employee
// @route   PATCH /api/employees/:id
const updateEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (employee) {
    const previousData = { ...employee._doc };
    
    employee.name = req.body.name || employee.name;
    employee.department = req.body.department || employee.department;
    employee.designation = req.body.designation || employee.designation;
    employee.salary = req.body.salary || employee.salary;
    employee.status = req.body.status || employee.status;
    
    const updatedEmployee = await employee.save();

    await logAudit(req.user, 'UPDATE', 'Employee', employee._id, { 
      changes: req.body,
      previous: previousData 
    });

    res.json(updatedEmployee);
  } else {
    res.status(404).json({ message: 'Employee not found' });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  
  if (employee) {
    await employee.deleteOne();
    // Also disable user account
    await User.findOneAndUpdate({ employeeId: req.params.id }, { isActive: false });
    
    await logAudit(req.user, 'DELETE', 'Employee', req.params.id, { name: employee.name });
    
    res.json({ message: 'Employee removed' });
  } else {
    res.status(404).json({ message: 'Employee not found' });
  }
};

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };
