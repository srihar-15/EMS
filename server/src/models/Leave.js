const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['vacation', 'sick', 'personal', 'maternity', 'paternity'],
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  days: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: { 
    type: String, 
    enum: ['Pending', 'L1_Approved', 'L2_Approved', 'Rejected'], 
    default: 'Pending' 
  },
  level: {
    type: String,
    enum: ['L1', 'L2'],
    default: 'L1'
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  rejectedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  rejectionReason: String
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);