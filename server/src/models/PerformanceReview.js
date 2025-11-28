const mongoose = require('mongoose');

const PerformanceReviewSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  reviewer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5 
  },
  comments: { 
    type: String, 
    required: true 
  },
  period: {
    type: String, // e.g., "Q1 2024", "Annual 2023"
    required: true
  },
  goals: [{
    description: String,
    status: { type: String, enum: ['Pending', 'In-Progress', 'Completed'], default: 'Pending' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('PerformanceReview', PerformanceReviewSchema);