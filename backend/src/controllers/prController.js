const PurchaseRequisition = require('../models/PurchaseRequisition');
const reorderService = require('../services/reorderService');

// @desc    Get all PRs
// @route   GET /api/purchase-requisitions
// @access  Private
exports.getAllPRs = async (req, res, next) => {
  try {
    const { status, warehouse } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (warehouse) query.warehouse = warehouse;

    const prs = await PurchaseRequisition.find(query)
      .populate('requestedBy', 'name email')
      .populate('warehouse', 'code name')
      .populate('items.sku', 'skuCode name')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: prs.length,
      data: { prs }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single PR
// @route   GET /api/purchase-requisitions/:id
// @access  Private
exports.getPR = async (req, res, next) => {
  try {
    const pr = await PurchaseRequisition.findById(req.params.id)
      .populate('requestedBy', 'name email')
      .populate('warehouse', 'code name address')
      .populate('items.sku', 'skuCode name unitCost')
      .populate('approvedBy', 'name email')
      .populate('convertedToPO');

    if (!pr) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Requisition not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { pr }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new PR
// @route   POST /api/purchase-requisitions
// @access  Private (Staff, Manager)
exports.createPR = async (req, res, next) => {
  try {
    const prData = {
      ...req.body,
      requestedBy: req.user._id
    };

    const pr = await PurchaseRequisition.create(prData);

    res.status(201).json({
      status: 'success',
      message: 'Purchase Requisition created successfully',
      data: { pr }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update PR
// @route   PUT /api/purchase-requisitions/:id
// @access  Private
exports.updatePR = async (req, res, next) => {
  try {
    const pr = await PurchaseRequisition.findById(req.params.id);

    if (!pr) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Requisition not found'
      });
    }

    // Only allow updates if PR is in DRAFT status
    if (pr.status !== 'DRAFT') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only update PR in DRAFT status'
      });
    }

    Object.assign(pr, req.body);
    await pr.save();

    res.status(200).json({
      status: 'success',
      message: 'Purchase Requisition updated successfully',
      data: { pr }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit PR for approval
// @route   POST /api/purchase-requisitions/:id/submit
// @access  Private
exports.submitPR = async (req, res, next) => {
  try {
    const pr = await PurchaseRequisition.findById(req.params.id);

    if (!pr) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Requisition not found'
      });
    }

    if (pr.status !== 'DRAFT') {
      return res.status(400).json({
        status: 'error',
        message: 'PR must be in DRAFT status to submit'
      });
    }

    pr.status = 'SUBMITTED';
    await pr.save();

    res.status(200).json({
      status: 'success',
      message: 'Purchase Requisition submitted for approval',
      data: { pr }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve PR
// @route   POST /api/purchase-requisitions/:id/approve
// @access  Private (Manager, Admin)
exports.approvePR = async (req, res, next) => {
  try {
    const pr = await PurchaseRequisition.findById(req.params.id);

    if (!pr) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Requisition not found'
      });
    }

    if (pr.status !== 'SUBMITTED') {
      return res.status(400).json({
        status: 'error',
        message: 'PR must be in SUBMITTED status to approve'
      });
    }

    pr.status = 'APPROVED';
    pr.approvedBy = req.user._id;
    pr.approvalDate = new Date();
    await pr.save();

    res.status(200).json({
      status: 'success',
      message: 'Purchase Requisition approved successfully',
      data: { pr }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject PR
// @route   POST /api/purchase-requisitions/:id/reject
// @access  Private (Manager, Admin)
exports.rejectPR = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required'
      });
    }

    const pr = await PurchaseRequisition.findById(req.params.id);

    if (!pr) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Requisition not found'
      });
    }

    if (pr.status !== 'SUBMITTED') {
      return res.status(400).json({
        status: 'error',
        message: 'PR must be in SUBMITTED status to reject'
      });
    }

    pr.status = 'REJECTED';
    pr.rejectionReason = reason;
    await pr.save();

    res.status(200).json({
      status: 'success',
      message: 'Purchase Requisition rejected',
      data: { pr }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete PR
// @route   DELETE /api/purchase-requisitions/:id
// @access  Private (Admin only)
exports.deletePR = async (req, res, next) => {
  try {
    const pr = await PurchaseRequisition.findById(req.params.id);

    if (!pr) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase Requisition not found'
      });
    }

    // Only allow deletion of DRAFT or REJECTED PRs
    if (pr.status !== 'DRAFT' && pr.status !== 'REJECTED') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only delete DRAFT or REJECTED PRs'
      });
    }

    await pr.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Purchase Requisition deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert PR to PO
// @route   POST /api/purchase-requisitions/:id/convert-to-po
// @access  Private (Manager, Admin)
exports.convertToPO = async (req, res, next) => {
  try {
    const pos = await reorderService.convertPRtoPO(req.params.id, req.user._id);

    res.status(201).json({
      status: 'success',
      message: 'Purchase Orders created from PR',
      data: { pos }
    });
  } catch (error) {
    next(error);
  }
};
