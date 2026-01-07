const mongoose = require('mongoose');

const prItemSchema = new mongoose.Schema({
  sku: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SKU',
    required: true
  },
  requestedQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  remarks: String
});

const purchaseRequisitionSchema = new mongoose.Schema({
  prNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  items: [prItemSchema],
  justification: {
    type: String,
    trim: true
  },
  requiredByDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CONVERTED_TO_PO'],
    default: 'DRAFT'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  rejectionReason: String,
  convertedToPO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  }
}, {
  timestamps: true
});

// Auto-generate PR number
purchaseRequisitionSchema.pre('save', async function(next) {
  if (!this.prNumber) {
    // Find the highest PR number
    const lastPR = await mongoose.model('PurchaseRequisition')
      .findOne()
      .sort({ prNumber: -1 })
      .select('prNumber')
      .lean();
    
    let nextNumber = 1;
    if (lastPR && lastPR.prNumber) {
      // Extract number from PR000001 format
      const currentNumber = parseInt(lastPR.prNumber.replace('PR', ''));
      nextNumber = currentNumber + 1;
    }
    
    this.prNumber = `PR${String(nextNumber).padStart(6, '0')}`;
  }
  next();
});

// Indexes - prNumber already has unique index
purchaseRequisitionSchema.index({ status: 1 });
purchaseRequisitionSchema.index({ requestedBy: 1 });

module.exports = mongoose.model('PurchaseRequisition', purchaseRequisitionSchema);
