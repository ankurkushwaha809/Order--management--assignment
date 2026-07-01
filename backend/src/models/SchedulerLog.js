const mongoose = require('mongoose');

const LogDetailSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  previousStatus: {
    type: String,
    required: true
  },
  newStatus: {
    type: String,
    required: true
  }
}, { _id: false });

const SchedulerLogSchema = new mongoose.Schema({
  executionId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  durationMs: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['SUCCESS', 'FAILED']
  },
  ordersProcessed: {
    type: Number,
    required: true,
    default: 0
  },
  ordersUpdated: {
    type: Number,
    required: true,
    default: 0
  },
  checkedOrders: [String], // Array of orderIds inspected during this run
  details: [LogDetailSchema],
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SchedulerLog', SchedulerLogSchema);
