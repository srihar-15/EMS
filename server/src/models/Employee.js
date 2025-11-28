const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  department: { 
    type: String, 
    required: true 
  },
  designation: { 
    type: String, 
    required: true 
  },
  salary: { 
    type: Number, 
    required: true 
  },
  dateOfJoining: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Probation', 'Terminated'], 
    default: 'Active' 
  },
  // Keeping existing frontend fields for compatibility
  avatar: { type: String },
  email: { type: String, unique: true }, // Redundant with User but useful for quick lookup
  leaveBalance: {
    vacation: { type: Number, default: 20 },
    sick: { type: Number, default: 10 },
    personal: { type: Number, default: 5 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);