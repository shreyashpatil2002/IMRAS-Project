const SKU = require('../models/SKU');
const PurchaseRequisition = require('../models/PurchaseRequisition');
const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');
const stockService = require('./stockService');

class ReorderService {
  // Generate automatic reorder suggestions
  async generateReorderSuggestions(warehouseId = null) {
    const skusBelowReorder = await stockService.getSKUsBelowReorderPoint(warehouseId);
    
    const suggestions = [];

    // Get pending PRs for this warehouse to check for duplicates
    const pendingPRs = await PurchaseRequisition.find({
      warehouse: warehouseId || { $exists: true },
      status: { $in: ['DRAFT', 'SUBMITTED', 'APPROVED'] }
    }).select('items warehouse');

    // Create a set of SKU IDs that already have pending PRs
    const skusWithPendingPR = new Set();
    pendingPRs.forEach(pr => {
      pr.items.forEach(item => {
        const key = `${pr.warehouse}_${item.sku}`;
        skusWithPendingPR.add(key);
      });
    });

    for (const item of skusBelowReorder) {
      const sku = await SKU.findById(item.sku).populate('supplier');
      
      if (!sku) continue;

      // Check if this SKU already has a pending PR for this warehouse
      const prKey = `${item.warehouse}_${item.sku}`;
      const hasPendingPR = skusWithPendingPR.has(prKey);

      // Calculate order quantity considering lead time and safety stock
      const orderQty = item.recommendedOrderQty;

      // Get best price from supplier pricing tiers if supplier exists
      let unitPrice = sku.unitCost || 0;
      let supplier = null;

      if (sku.supplier) {
        supplier = await Supplier.findById(sku.supplier);
        
        if (supplier && supplier.pricingTiers && supplier.pricingTiers.length > 0) {
          const applicableTiers = supplier.pricingTiers
            .filter(tier => orderQty >= tier.minQty)
            .sort((a, b) => b.minQty - a.minQty);
          
          if (applicableTiers.length > 0) {
            unitPrice = applicableTiers[0].pricePerUnit;
          }
        }
      }

      suggestions.push({
        sku: {
          _id: sku._id,
          skuCode: sku.skuCode,
          name: sku.name,
          description: sku.description,
          unit: sku.unit
        },
        warehouse: item.warehouse,
        warehouseName: item.warehouseName,
        currentStock: item.currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock,
        safetyStock: item.safetyStock,
        recommendedOrderQty: orderQty,
        supplier: supplier ? {
          _id: supplier._id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone
        } : null,
        unitPrice,
        totalCost: orderQty * unitPrice,
        urgency: item.urgency,
        leadTime: sku.leadTime || 7,
        hasPendingPR: hasPendingPR
      });
    }

    return suggestions;
  }

  // Create draft PR from reorder suggestions
  async createDraftPRFromSuggestions(suggestions, warehouseId, userId) {
    if (!suggestions || suggestions.length === 0) {
      throw new Error('No suggestions provided');
    }

    if (!warehouseId) {
      throw new Error('Warehouse ID is required');
    }

    // Suggestions from frontend are already filtered, just map to items format
    const items = suggestions.map(s => ({
      sku: s.sku,
      requestedQuantity: s.requestedQuantity,
      urgency: s.urgency,
      remarks: s.remarks || 'Auto-generated reorder suggestion'
    }));

    const pr = await PurchaseRequisition.create({
      requestedBy: userId,
      warehouse: warehouseId,
      items,
      justification: 'Automatic reorder - Stock below minimum level',
      status: 'DRAFT'
    });

    return pr;
  }

  // Convert PR to draft PO
  async convertPRtoPO(prId, userId) {
    const pr = await PurchaseRequisition.findById(prId)
      .populate({
        path: 'items.sku',
        populate: { path: 'supplier' }
      });

    if (!pr) throw new Error('Purchase Requisition not found');
    if (pr.status !== 'APPROVED') throw new Error('PR must be approved before converting to PO');
    if (pr.convertedToPO) throw new Error('PR already converted to PO');

    // Group items by supplier
    const supplierGroups = {};
    
    for (const item of pr.items) {
      if (!item.sku || !item.sku.supplier) continue;
      
      const supplierId = item.sku.supplier._id.toString();
      if (!supplierGroups[supplierId]) {
        supplierGroups[supplierId] = {
          supplier: item.sku.supplier,
          items: []
        };
      }

      // Get unit price from supplier
      let unitPrice = item.sku.unitCost;
      const supplier = item.sku.supplier;
      
      if (supplier.pricingTiers && supplier.pricingTiers.length > 0) {
        const applicableTiers = supplier.pricingTiers
          .filter(tier => item.requestedQuantity >= tier.minQty)
          .sort((a, b) => b.minQty - a.minQty);
        
        if (applicableTiers.length > 0) {
          unitPrice = applicableTiers[0].pricePerUnit;
        }
      }

      supplierGroups[supplierId].items.push({
        sku: item.sku._id,
        orderedQuantity: item.requestedQuantity,
        unitPrice,
        totalPrice: item.requestedQuantity * unitPrice
      });
    }

    // Create POs for each supplier
    const pos = [];
    for (const [supplierId, group] of Object.entries(supplierGroups)) {
      const totalAmount = group.items.reduce((sum, item) => sum + item.totalPrice, 0);

      const po = await PurchaseOrder.create({
        requisition: prId,
        supplier: supplierId,
        warehouse: pr.warehouse,
        items: group.items,
        totalAmount,
        createdBy: userId,
        expectedDeliveryDate: pr.requiredByDate, // Use PR's required by date as expected delivery
        status: 'CREATED'
      });

      pos.push(po);
    }

    // Update PR
    pr.convertedToPO = pos[0]._id; // Link first PO
    pr.status = 'CONVERTED_TO_PO';
    await pr.save();

    return pos;
  }

  // Calculate demand history for a SKU
  async calculateDemandHistory(skuId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const StockLedger = require('../models/StockLedger');
    
    const outwardMovements = await StockLedger.find({
      sku: skuId,
      movementType: { $in: ['OUTWARD', 'TRANSFER_OUT'] },
      transactionDate: { $gte: startDate }
    });

    const totalDemand = outwardMovements.reduce((sum, entry) => sum + entry.quantity, 0);
    const avgDailyDemand = totalDemand / days;

    return {
      totalDemand,
      avgDailyDemand,
      days
    };
  }
}

module.exports = new ReorderService();
