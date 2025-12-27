const Order = require('../models/Order');
const Product = require('../models/Product');
const Batch = require('../models/Batch');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by order number or customer name
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name sku image')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

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
      .populate('items.product', 'name sku category image')
      .populate('items.batch', 'batchNumber')
      .populate('createdBy', 'name email');

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
    const { items, ...orderData } = req.body;

    // Validate and process order items
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: `Product not found: ${item.product}`
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient quantity for product: ${product.name}`
        });
      }

      // Deduct from product quantity
      product.quantity -= item.quantity;
      await product.save();

      // If batch tracking enabled, deduct from batch
      if (item.batch) {
        const batch = await Batch.findById(item.batch);
        if (batch) {
          batch.currentQuantity -= item.quantity;
          await batch.save();
        }
      }

      processedItems.push({
        product: item.product,
        quantity: item.quantity,
        price: item.price || product.sellingPrice,
        batch: item.batch
      });

      totalAmount += (item.price || product.sellingPrice) * item.quantity;
    }

    // Create order
    const order = await Order.create({
      ...orderData,
      items: processedItems,
      totalAmount,
      createdBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
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
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    order.status = status;

    // Update shipped/delivered date
    if (status === 'Shipped' && !order.shippedDate) {
      order.shippedDate = new Date();
    }
    if (status === 'Delivered' && !order.deliveredDate) {
      order.deliveredDate = new Date();
    }

    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
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
    const totalOrders = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: 'Pending' });
    const processing = await Order.countDocuments({ status: 'Processing' });
    const shipped = await Order.countDocuments({ status: 'Shipped' });
    const delivered = await Order.countDocuments({ status: 'Delivered' });
    const cancelled = await Order.countDocuments({ status: 'Cancelled' });

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalOrders,
          pending,
          processing,
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
