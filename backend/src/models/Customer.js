const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerCode: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {
    name: String,
    position: String,
    phone: String,
    email: String
  },
  customerType: {
    type: String,
    enum: ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR', 'OTHER'],
    default: 'RETAIL'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentTerms: {
    type: String,
    enum: ['CASH', 'NET_15', 'NET_30', 'NET_60', 'NET_90'],
    default: 'CASH'
  },
  taxId: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  notes: {
    type: String,
    trim: true
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-generate customer code
customerSchema.pre('save', async function(next) {
  if (!this.customerCode) {
    const count = await mongoose.model('Customer').countDocuments();
    this.customerCode = `CUST${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes - customerCode and email already have unique indexes
customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema);
