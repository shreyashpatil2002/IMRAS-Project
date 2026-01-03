const StockLedger = require('../models/StockLedger');
const PurchaseOrder = require('../models/PurchaseOrder');
const Order = require('../models/Order');

// @desc    Get all stock ledger transactions
// @route   GET /api/stock-ledger
// @access  Private
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { 
      movementType, 
      warehouse, 
      referenceType, 
      dateFrom, 
      dateTo,
      sku,
      limit = 100 
    } = req.query;
    
    let query = {};
    
    if (movementType) query.movementType = movementType;
    if (warehouse) query.warehouse = warehouse;
    if (referenceType) query.referenceType = referenceType;
    if (sku) query.sku = sku;
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.transactionDate = {};
      if (dateFrom) query.transactionDate.$gte = new Date(dateFrom);
      if (dateTo) query.transactionDate.$lte = new Date(dateTo);
    }

    const transactions = await StockLedger.find(query)
      .populate('sku', 'skuCode name')
      .populate('warehouse', 'code name')
      .populate('user', 'name email')
      .sort({ transactionDate: -1 })
      .limit(parseInt(limit));

    // Manually populate references based on referenceType
    for (let transaction of transactions) {
      if (transaction.referenceType === 'PO') {
        const po = await PurchaseOrder.findById(transaction.referenceId).select('poNumber createdAt');
        if (po) {
          transaction._doc.reference = { 
            number: po.poNumber, 
            date: po.createdAt,
            type: 'PO'
          };
        }
      } else if (transaction.referenceType === 'ORDER') {
        const order = await Order.findById(transaction.referenceId).select('orderNumber createdAt');
        if (order) {
          transaction._doc.reference = { 
            number: order.orderNumber, 
            date: order.createdAt,
            type: 'ORDER'
          };
        }
      } else {
        transaction._doc.reference = { 
          number: transaction.referenceId.toString().substring(0, 8), 
          date: transaction.transactionDate,
          type: transaction.referenceType
        };
      }
    }

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/stock-ledger/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await StockLedger.findById(req.params.id)
      .populate('sku', 'skuCode name description')
      .populate('warehouse', 'code name address')
      .populate('user', 'name email');

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock history for SKU
// @route   GET /api/stock-ledger/sku/:skuId
// @access  Private
exports.getSKUHistory = async (req, res, next) => {
  try {
    const { skuId } = req.params;
    const { warehouse, limit = 50 } = req.query;

    let query = { sku: skuId };
    if (warehouse) query.warehouse = warehouse;

    const history = await StockLedger.find(query)
      .populate('warehouse', 'code name')
      .populate('user', 'name email')
      .sort({ transactionDate: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: history.length,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
