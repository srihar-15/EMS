const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  checkIn: { 
    type: Date,
    required: true 
  },
  checkOut: { 
    type: Date 
  },
  totalHours: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['On-time', 'Late', 'Half-day', 'Missing', 'Overtime'],
    default: 'On-time'
  }
}, { timestamps: true });

// Compound index to prevent duplicate attendance records for same employee on same day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);