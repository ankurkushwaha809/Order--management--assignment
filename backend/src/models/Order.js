const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['PLACED', 'PROCESSING', 'READY_TO_SHIP', 'DELIVERED', 'CANCELLED']
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    default: 'Status updated'
  }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    index: true
  },
  phone: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['PLACED', 'PROCESSING', 'READY_TO_SHIP', 'DELIVERED', 'CANCELLED'],
    default: 'PLACED',
    index: true
  },
  statusHistory: [StatusHistorySchema]
}, {
  timestamps: true
});

// Pre-save hook to add initial history entry when order is created
OrderSchema.pre('save', function (next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.orderStatus,
      changedAt: new Date(),
      reason: 'Order placed successfully'
    });
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
