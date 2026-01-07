const mongoose = require('mongoose');

const skuSchema = new mongoose.Schema({
  skuCode: {
    type: String,
    required: [true, 'SKU code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'SKU name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Accessories', 'Office', 'Furniture', 'Tools', 'Other']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['PCS', 'KG', 'LTR', 'BOX', 'PACK', 'SET'],
    default: 'PCS'
  },
  minStock: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: 0,
    default: 10
  },
  maxStock: {
    type: Number,
    required: [true, 'Maximum stock level is required'],
    min: 0,
    default: 100
  },
  safetyStock: {
    type: Number,
    required: [true, 'Safety stock is required'],
    min: 0,
    default: 5
  },
  defaultWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  defaultBin: {
    type: String,
    trim: true
  },
  leadTime: {
    type: Number,
    default: 7,
    min: 0,
    comment: 'Lead time in days'
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
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries - skuCode already has unique index, just add others
skuSchema.index({ category: 1 });
skuSchema.index({ defaultWarehouse: 1 });

module.exports = mongoose.model('SKU', skuSchema);
