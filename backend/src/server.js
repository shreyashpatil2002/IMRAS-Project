require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/database');
const { securityHeaders, sanitizeBody, preventNoSQLInjection } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const batchRoutes = require('./routes/batchRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const skuRoutes = require('./routes/skuRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const prRoutes = require('./routes/prRoutes');
const poRoutes = require('./routes/poRoutes');
const transferRoutes = require('./routes/transferRoutes');
const reorderRoutes = require('./routes/reorderRoutes');
const stockLedgerRoutes = require('./routes/stockLedgerRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Compression middleware
app.use(compression());

// Security middleware
app.use(securityHeaders);
app.use(preventNoSQLInjection);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeBody);
app.use(morgan('dev'));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'IMRAS API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/skus', skuRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/purchase-requisitions', prRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/reorder', reorderRoutes);
app.use('/api/stock-ledger', stockLedgerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
