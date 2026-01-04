const Customer = require('../models/Customer');
const Order = require('../models/Order');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getAllCustomers = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by name, code, or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { customerCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: customers.length,
      data: { customers }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found'
      });
    }

    // Get customer orders
    const orders = await Order.find({ customer: req.params.id })
      .sort('-orderDate')
      .limit(10)
      .select('orderNumber totalAmount status orderDate');

    res.status(200).json({
      status: 'success',
      data: { 
        customer,
        recentOrders: orders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create({
      ...req.body
    });

    res.status(201).json({
      status: 'success',
      message: 'Customer created successfully',
      data: { customer }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Customer with this email already exists'
      });
    }
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Admin, Manager)
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Customer updated successfully',
      data: { customer }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin)
exports.deleteCustomer = async (req, res, next) => {
  try {
    // Check if customer has orders
    const orderCount = await Order.countDocuments({ customer: req.params.id });
    
    if (orderCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete customer with ${orderCount} existing order(s). Consider deactivating instead.`
      });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found'
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats/overview
// @access  Private
exports.getCustomerStats = async (req, res, next) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const active = await Customer.countDocuments({ status: 'Active' });
    const inactive = await Customer.countDocuments({ status: 'Inactive' });
    const suspended = await Customer.countDocuments({ status: 'Suspended' });

    // Top customers by revenue
    const topCustomers = await Customer.find()
      .sort('-totalRevenue')
      .limit(5)
      .select('name customerCode totalRevenue totalOrders');

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalCustomers,
          active,
          inactive,
          suspended
        },
        topCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};
