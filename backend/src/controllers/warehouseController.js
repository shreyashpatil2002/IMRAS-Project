const Warehouse = require('../models/Warehouse');
const stockService = require('../services/stockService');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
exports.getAllWarehouses = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    
    let query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const warehouses = await Warehouse.find(query)
      .populate('manager', 'name email')
      .sort({ code: 1 });

    res.status(200).json({
      status: 'success',
      results: warehouses.length,
      data: { warehouses }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single warehouse
// @route   GET /api/warehouses/:id
// @access  Private
exports.getWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id)
      .populate('manager', 'name email phone');

    if (!warehouse) {
      return res.status(404).json({
        status: 'error',
        message: 'Warehouse not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { warehouse }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new warehouse
// @route   POST /api/warehouses
// @access  Private (Admin)
exports.createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Warehouse created successfully',
      data: { warehouse }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private (Admin)
exports.updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!warehouse) {
      return res.status(404).json({
        status: 'error',
        message: 'Warehouse not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Warehouse updated successfully',
      data: { warehouse }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete warehouse (soft delete)
// @route   DELETE /api/warehouses/:id
// @access  Private (Admin)
exports.deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!warehouse) {
      return res.status(404).json({
        status: 'error',
        message: 'Warehouse not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Warehouse deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add location to warehouse
// @route   POST /api/warehouses/:id/locations
// @access  Private (Admin, Manager)
exports.addLocation = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        status: 'error',
        message: 'Warehouse not found'
      });
    }

    warehouse.locations.push(req.body);
    await warehouse.save();

    res.status(201).json({
      status: 'success',
      message: 'Location added successfully',
      data: { warehouse }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update location in warehouse
// @route   PUT /api/warehouses/:id/locations/:locationId
// @access  Private (Admin, Manager)
exports.updateLocation = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        status: 'error',
        message: 'Warehouse not found'
      });
    }

    const location = warehouse.locations.id(req.params.locationId);
    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found'
      });
    }

    Object.assign(location, req.body);
    await warehouse.save();

    res.status(200).json({
      status: 'success',
      message: 'Location updated successfully',
      data: { warehouse }
    });
  } catch (error) {
    next(error);
  }
};
