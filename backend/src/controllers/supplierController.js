const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
exports.getAllSuppliers = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: suppliers.length,
      data: { suppliers }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
exports.getSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        status: 'error',
        message: 'Supplier not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private (Admin, Manager)
exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Supplier created successfully',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin, Manager)
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({
        status: 'error',
        message: 'Supplier not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Supplier updated successfully',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        status: 'error',
        message: 'Supplier not found'
      });
    }

    await supplier.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
