const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema({
  sku: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SKU',
    required: [true, 'SKU is required']
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required']
  },
  location: {
    aisle: String,
    bin: String
  },
  movementType: {
    type: String,
    required: [true, 'Movement type is required'],
    enum: ['INWARD', 'OUTWARD', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required']
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  referenceType: {
    type: String,
    enum: ['PO', 'ORDER', 'TRANSFER', 'ADJUSTMENT', 'PR'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  balanceQuantity: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remarks: {
    type: String,
    trim: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
stockLedgerSchema.index({ sku: 1, warehouse: 1 });
stockLedgerSchema.index({ movementType: 1 });
stockLedgerSchema.index({ transactionDate: -1 });
stockLedgerSchema.index({ referenceType: 1, referenceId: 1 });

// Method to get current stock for SKU in warehouse
stockLedgerSchema.statics.getCurrentStock = async function(skuId, warehouseId) {
  const latestEntry = await this.findOne({
    sku: skuId,
    warehouse: warehouseId
  }).sort({ transactionDate: -1 });
  
  return latestEntry ? latestEntry.balanceQuantity : 0;
};

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
