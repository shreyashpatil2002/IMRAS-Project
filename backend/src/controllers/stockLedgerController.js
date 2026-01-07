const StockLedger = require('../models/StockLedger');
const PurchaseOrder = require('../models/PurchaseOrder');
const Order = require('../models/Order');
const WarehouseTransfer = require('../models/WarehouseTransfer');

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

// @desc    Get current user's activity log
// @route   GET /api/stock-ledger/my-activity
// @access  Private
exports.getMyActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { filter = 'all', limit = 50 } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    if (filter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = { transactionDate: { $gte: startOfDay } };
    } else if (filter === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { transactionDate: { $gte: startOfWeek } };
    } else if (filter === 'month') {
      const startOfMonth = new Date(now.setDate(now.getDate() - 30));
      dateFilter = { transactionDate: { $gte: startOfMonth } };
    }

    const activities = await StockLedger.find({
      user: userId,
      ...dateFilter
    })
      .populate('sku', 'skuCode name')
      .populate('warehouse', 'code name')
      .sort({ transactionDate: -1 })
      .limit(parseInt(limit));

    // Get reference details
    for (let activity of activities) {
      let reference = { number: 'N/A', type: activity.referenceType };
      
      try {
        if (activity.referenceType === 'PO') {
          const po = await PurchaseOrder.findById(activity.referenceId).select('poNumber');
          if (po) reference.number = po.poNumber;
        } else if (activity.referenceType === 'ORDER') {
          const order = await Order.findById(activity.referenceId).select('orderNumber');
          if (order) reference.number = order.orderNumber;
        } else if (activity.referenceType === 'TRANSFER') {
          const transfer = await WarehouseTransfer.findById(activity.referenceId).select('transferNumber');
          if (transfer) reference.number = transfer.transferNumber;
        }
      } catch (err) {
        // Failed to fetch reference, use default
      }
      
      activity._doc.reference = reference;
    }

    // Calculate stats
    const stats = {
      completedToday: await StockLedger.countDocuments({
        user: userId,
        transactionDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      thisWeek: await StockLedger.countDocuments({
        user: userId,
        transactionDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      }),
      thisMonth: await StockLedger.countDocuments({
        user: userId,
        transactionDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
      })
    };

    res.status(200).json({
      status: 'success',
      results: activities.length,
      data: { activities, stats }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;


