const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  items: [{
    sku: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SKU',
      required: true
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    pickedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PICKING', 'PICKED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'REFUNDED', 'PARTIAL'],
    default: 'PENDING'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingMethod: {
    type: String,
    trim: true
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  confirmedDate: {
    type: Date
  },
  pickedDate: {
    type: Date
  },
  packedDate: {
    type: Date
  },
  shippedDate: {
    type: Date
  },
  deliveredDate: {
    type: Date
  },
  cancelledDate: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  pickedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  packedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  shippedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SO${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes - orderNumber already has unique index
orderSchema.index({ status: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ warehouse: 1 });
orderSchema.index({ orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);
