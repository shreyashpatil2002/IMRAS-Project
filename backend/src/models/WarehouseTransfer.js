const mongoose = require('mongoose');

const transferItemSchema = new mongoose.Schema({
  sku: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SKU',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  batchNumber: String,
  expiryDate: Date
});

const warehouseTransferSchema = new mongoose.Schema({
  transferNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  sourceWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  destinationWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  items: [transferItemSchema],
  status: {
    type: String,
    enum: ['REQUESTED', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'REJECTED', 'CANCELLED'],
    default: 'REQUESTED'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  dispatchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dispatchedDate: Date,
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receivedDate: Date,
  rejectionReason: String,
  notes: String
}, {
  timestamps: true
});

// Auto-generate transfer number
warehouseTransferSchema.pre('save', async function(next) {
  if (!this.transferNumber) {
    const count = await mongoose.model('WarehouseTransfer').countDocuments();
    this.transferNumber = `TRF${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes - transferNumber already has unique index
warehouseTransferSchema.index({ status: 1 });
warehouseTransferSchema.index({ sourceWarehouse: 1 });
warehouseTransferSchema.index({ destinationWarehouse: 1 });

module.exports = mongoose.model('WarehouseTransfer', warehouseTransferSchema);
