const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by name or SKU
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('supplier', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name email phone address');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin, Manager)
exports.createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save(); // This will trigger the pre-save hook

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Manager)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      product[key] = req.body[key];
    });

    // Save will trigger the pre-save hook to calculate status
    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product statistics
// @route   GET /api/products/stats/overview
// @access  Private
exports.getProductStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const inStock = await Product.countDocuments({ status: 'In Stock' });
    const lowStock = await Product.countDocuments({ status: 'Low Stock' });
    const outOfStock = await Product.countDocuments({ status: 'Out of Stock' });
    const critical = await Product.countDocuments({ status: 'Critical' });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalProducts,
          inStock,
          lowStock,
          outOfStock,
          critical
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
