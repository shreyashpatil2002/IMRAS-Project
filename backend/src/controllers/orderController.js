const Order = require('../models/Order');
const Customer = require('../models/Customer');
const SKU = require('../models/SKU');
const Batch = require('../models/Batch');
const StockLedger = require('../models/StockLedger');
const Warehouse = require('../models/Warehouse');
const stockService = require('../services/stockService');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, search, warehouse } = req.query;
    const user = req.user;
    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by warehouse - non-admin sees only their warehouse
    if (user.role !== 'ADMIN') {
      if (user.assignedWarehouse) {
        query.warehouse = user.assignedWarehouse;
      }
    } else if (warehouse) {
      query.warehouse = warehouse;
    }

    // Search by order number or customer name
    if (search) {
      const customers = await Customer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { customerCode: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const customerIds = customers.map(c => c._id);
      
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customer: { $in: customerIds } }
      ];
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone customerCode')
      .populate('warehouse', 'name code')
      .populate('items.sku', 'skuCode name unit')
      .populate('items.batch', 'batchNumber expiryDate location')
      .populate('createdBy', 'name email')
      .sort('-orderDate');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('warehouse', 'name code address')
      .populate('items.sku', 'skuCode name category unit')
      .populate('items.batch', 'batchNumber expiryDate location')
      .populate('createdBy', 'name email')
      .populate('pickedBy', 'name email')
      .populate('packedBy', 'name email')
      .populate('shippedBy', 'name email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { customer, items, warehouse, shippingAddress, shippingMethod, notes } = req.body;

    // Validate customer
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found'
      });
    }

    // Validate warehouse
    const warehouseDoc = await Warehouse.findById(warehouse);
    if (!warehouseDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Warehouse not found'
      });
    }

    // Validate and process order items
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const sku = await SKU.findById(item.sku);
      
      if (!sku) {
        return res.status(404).json({
          status: 'error',
          message: `SKU not found: ${item.sku}`
        });
      }

      // If batch is provided, find and validate it (but don't deduct yet)
      let batch = null;
      if (item.batch) {
        batch = await Batch.findById(item.batch);
        if (!batch) {
          return res.status(404).json({
            status: 'error',
            message: `Batch not found: ${item.batch}`
          });
        }

        // Check batch has sufficient quantity
        if (batch.currentQuantity < item.quantity) {
          return res.status(400).json({
            status: 'error',
            message: `Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.currentQuantity}, Requested: ${item.quantity}`
          });
        }

        // Don't deduct yet - will deduct when order is shipped/dispatched
      } else {
        // If no specific batch provided, check overall stock availability
        const currentStock = await stockService.getCurrentStock(item.sku, warehouse);
        
        if (currentStock < item.quantity) {
          return res.status(400).json({
            status: 'error',
            message: `Insufficient stock for SKU: ${sku.skuCode}. Available: ${currentStock}, Requested: ${item.quantity}`
          });
        }
      }

      const unitPrice = item.unitPrice || sku.sellingPrice;
      const totalPrice = unitPrice * item.quantity;

      processedItems.push({
        sku: item.sku,
        batch: item.batch || null,
        quantity: item.quantity,
        unitPrice,
        totalPrice
      });

      totalAmount += totalPrice;
    }

    // Create order
    const order = await Order.create({
      customer,
      items: processedItems,
      warehouse,
      totalAmount,
      shippingAddress,
      shippingMethod,
      notes,
      status: 'PENDING', // Requires admin approval before warehouse can process
      createdBy: req.user.id
    });

    // Stock will be deducted when order is dispatched/shipped by warehouse staff

    // Update customer stats
    customerDoc.totalOrders += 1;
    await customerDoc.save();

    await order.populate([
      { path: 'customer', select: 'name email customerCode' },
      { path: 'warehouse', select: 'name code' },
      { path: 'items.sku', select: 'skuCode name unit' },
      { path: 'items.batch', select: 'batchNumber expiryDate' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully. Awaiting admin approval before dispatch.',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private (Admin, Manager)
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Order updated successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin, Manager)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, items } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('items.sku');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Handle different status transitions
    if (status === 'CONFIRMED') {
      // Admin approves the order
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Only admin can approve orders'
        });
      }
      order.status = status;
      order.confirmedDate = new Date();
      order.approvedBy = req.user.id;
      order.approvedDate = new Date();
      
    } else if (status === 'PICKING') {
      order.status = status;
      
    } else if (status === 'PICKED') {
      // Batches already allocated during order creation
      // Just mark order as picked
      order.status = status;
      order.pickedDate = new Date();
      order.pickedBy = req.user.id;

    } else if (status === 'PACKED') {
      order.status = status;
      order.packedDate = new Date();
      order.packedBy = req.user.id;
      
    } else if (status === 'SHIPPED') {
      // Deduct stock from batches and create stock ledger entries when dispatching
      for (const item of order.items) {
        if (item.batch) {
          const batch = await Batch.findById(item.batch);
          if (!batch) {
            return res.status(404).json({
              status: 'error',
              message: `Batch not found: ${item.batch}`
            });
          }

          // Check batch has sufficient quantity
          if (batch.currentQuantity < item.quantity) {
            return res.status(400).json({
              status: 'error',
              message: `Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.currentQuantity}, Requested: ${item.quantity}`
            });
          }

          // Deduct from batch
          batch.currentQuantity -= item.quantity;
          await batch.save();

          // Parse location for stock ledger
          let locationObj = undefined;
          if (batch.location) {
            const parts = batch.location.split('-');
            if (parts.length >= 2) {
              locationObj = {
                aisle: parts[0],
                bin: parts.length > 2 ? parts[2] : parts[1]
              };
            }
          }

          // Create OUTWARD stock ledger entry using stockService.recordMovement
          await stockService.recordMovement({
            sku: item.sku,
            warehouse: order.warehouse,
            movementType: 'OUTWARD',
            quantity: item.quantity,
            referenceType: 'ORDER',
            referenceId: order._id,
            user: req.user.id,
            batchNumber: batch.batchNumber,
            expiryDate: batch.expiryDate,
            location: locationObj,
            remarks: `Sales order ${order.orderNumber} - dispatched ${item.quantity} units from batch ${batch.batchNumber}`
          });
        }
      }

      order.status = status;
      order.shippedDate = new Date();
      order.shippedBy = req.user.id;
      
      // Update customer revenue
      const customer = await Customer.findById(order.customer);
      if (customer) {
        customer.totalRevenue += order.totalAmount;
        await customer.save();
      }
      
    } else if (status === 'DELIVERED') {
      order.status = status;
      order.deliveredDate = new Date();
      
    } else if (status === 'CANCELLED') {
      // If order was already shipped, don't return stock (it's already gone)
      if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        return res.status(400).json({
          status: 'error',
          message: `Cannot cancel order that has been ${order.status.toLowerCase()}. Stock has already been dispatched.`
        });
      }
      
      // Stock was never deducted (order not shipped yet), so no need to return anything
      // Orders in PENDING, CONFIRMED, PICKING, PICKED, or PACKED status have not deducted stock yet
      
      order.status = status;
      order.cancelledDate = new Date();
      order.cancelReason = req.body.cancelReason;
    }

    await order.save();

    await order.populate([
      { path: 'customer', select: 'name email customerCode' },
      { path: 'warehouse', select: 'name code' },
      { path: 'items.sku', select: 'skuCode name unit' },
      { path: 'items.batch', select: 'batchNumber expiryDate' }
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    await order.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/overview
// @access  Private
exports.getOrderStats = async (req, res, next) => {
  try {
    const user = req.user;
    let matchQuery = {};

    // Non-admin users see only their warehouse stats
    if (user.role !== 'ADMIN' && user.assignedWarehouse) {
      matchQuery.warehouse = user.assignedWarehouse;
    }

    const totalOrders = await Order.countDocuments(matchQuery);
    const pending = await Order.countDocuments({ ...matchQuery, status: 'PENDING' });
    const confirmed = await Order.countDocuments({ ...matchQuery, status: 'CONFIRMED' });
    const picking = await Order.countDocuments({ ...matchQuery, status: 'PICKING' });
    const picked = await Order.countDocuments({ ...matchQuery, status: 'PICKED' });
    const packed = await Order.countDocuments({ ...matchQuery, status: 'PACKED' });
    const shipped = await Order.countDocuments({ ...matchQuery, status: 'SHIPPED' });
    const delivered = await Order.countDocuments({ ...matchQuery, status: 'DELIVERED' });
    const cancelled = await Order.countDocuments({ ...matchQuery, status: 'CANCELLED' });

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $match: { ...matchQuery, status: { $nin: ['CANCELLED'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalOrders,
          pending,
          confirmed,
          picking,
          picked,
          packed,
          shipped,
          delivered,
          cancelled,
          totalRevenue
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available batches for picking (FEFO)
// @route   GET /api/orders/:id/available-batches
// @access  Private
exports.getAvailableBatches = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.sku');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    const availableBatches = [];

    for (const item of order.items) {
      // Find batches with stock, sorted by expiry date (FEFO)
      const batches = await Batch.find({
        product: item.sku._id,
        warehouse: order.warehouse,
        currentQuantity: { $gt: 0 },
        status: { $in: ['Active', 'Low Stock'] }
      })
      .sort({ expiryDate: 1 }) // FEFO - First Expire First Out
      .select('batchNumber currentQuantity expiryDate location');

      availableBatches.push({
        sku: item.sku,
        requiredQuantity: item.quantity,
        batches
      });
    }

    res.status(200).json({
      status: 'success',
      data: { availableBatches }
    });
  } catch (error) {
    next(error);
  }
};
