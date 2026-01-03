const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  sku: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SKU',
    required: true
  },
  orderedQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  receivedQuantity: {
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
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  requisition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseRequisition'
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  items: [poItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['CREATED', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED'],
    default: 'CREATED'
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
  approvalDate: Date,
  sentDate: Date,
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  paymentTerms: {
    type: String,
    trim: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: String
}, {
  timestamps: true
});

// Auto-generate PO number
purchaseOrderSchema.pre('save', async function(next) {
  if (!this.poNumber) {
    // Find the highest PO number
    const lastPO = await mongoose.model('PurchaseOrder')
      .findOne()
      .sort({ poNumber: -1 })
      .select('poNumber')
      .lean();
    
    let nextNumber = 1;
    if (lastPO && lastPO.poNumber) {
      // Extract number from PO000001 format
      const currentNumber = parseInt(lastPO.poNumber.replace('PO', ''));
      nextNumber = currentNumber + 1;
    }
    
    this.poNumber = `PO${String(nextNumber).padStart(6, '0')}`;
  }
  next();
});

// Indexes
purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ supplier: 1 });
purchaseOrderSchema.index({ warehouse: 1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
