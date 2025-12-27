const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Accessories', 'Office', 'Other']
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  unitCost: {
    type: Number,
    required: [true, 'Unit cost is required'],
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: 10,
    min: 0
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
  batchTrackingEnabled: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Critical', 'Out of Stock'],
    default: 'In Stock'
  }
}, {
  timestamps: true
});

// Calculate status based on quantity
productSchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= 5) {
    this.status = 'Critical';
  } else if (this.quantity <= this.reorderPoint) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
