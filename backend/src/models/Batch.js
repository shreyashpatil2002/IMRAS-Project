const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  initialQuantity: {
    type: Number,
    required: [true, 'Initial quantity is required'],
    min: 0
  },
  currentQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  receivedDate: {
    type: Date,
    required: [true, 'Received date is required'],
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  qrCode: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Low Stock', 'Expiring Soon', 'Expired', 'Depleted'],
    default: 'Active'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate status before saving
batchSchema.pre('save', function(next) {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((this.expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (this.currentQuantity === 0) {
    this.status = 'Depleted';
  } else if (this.expiryDate < now) {
    this.status = 'Expired';
  } else if (daysUntilExpiry <= 30) {
    this.status = 'Expiring Soon';
  } else if (this.currentQuantity <= this.initialQuantity * 0.2) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Active';
  }
  next();
});

module.exports = mongoose.model('Batch', batchSchema);
