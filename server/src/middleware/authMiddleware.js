
const User = require('../models/User');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // 1. Try finding User by ID
      let user = await User.findById(token).select('-passwordHash');
      
      // 2. DEMO FALLBACK: If User ID not found, check if it's an Employee ID
      // This allows the frontend to send employee.id as the token
      if (!user) {
          const employee = await Employee.findById(token);
          if (employee) {
              // Find the linked user or create a temp context
              user = await User.findOne({ employeeId: employee._id });
              if (!user) {
                  // Fallback context if data integrity is off in demo
                  user = { _id: 'temp', role: employee.role, employeeId: employee._id, email: employee.email };
              }
          }
      }

      if (!user) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
