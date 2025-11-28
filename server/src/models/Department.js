const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  budget: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  usedBudget: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  fiscalYear: {
    type: Number,
    default: new Date().getFullYear()
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);