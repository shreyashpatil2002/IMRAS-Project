const SKU = require('../models/SKU');
const StockLedger = require('../models/StockLedger');
const PurchaseRequisition = require('../models/PurchaseRequisition');

class StockService {
  // Get current stock for SKU in specific warehouse
  async getCurrentStock(skuId, warehouseId) {
    return await StockLedger.getCurrentStock(skuId, warehouseId);
  }

  // Get total stock across all warehouses for SKU
  async getTotalStock(skuId) {
    const ledgerEntries = await StockLedger.aggregate([
      { $match: { sku: skuId } },
      { $sort: { warehouse: 1, transactionDate: -1 } },
      {
        $group: {
          _id: '$warehouse',
          latestBalance: { $first: '$balanceQuantity' }
        }
      },
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$latestBalance' }
        }
      }
    ]);

    return ledgerEntries.length > 0 ? ledgerEntries[0].totalStock : 0;
  }

  // Record stock movement
  async recordMovement(data) {
    const { sku, warehouse, movementType, quantity, referenceType, referenceId, user, location, batchNumber, expiryDate, remarks } = data;

    // Get current balance
    const currentBalance = await this.getCurrentStock(sku, warehouse);

    // Calculate new balance
    let newBalance;
    if (movementType === 'INWARD' || movementType === 'TRANSFER_IN') {
      newBalance = currentBalance + quantity;
    } else if (movementType === 'OUTWARD' || movementType === 'TRANSFER_OUT') {
      newBalance = currentBalance - quantity;
      if (newBalance < 0) {
        throw new Error('Insufficient stock');
      }
    } else if (movementType === 'ADJUSTMENT') {
      newBalance = currentBalance + quantity; // quantity can be negative for adjustments
    }

    // Create ledger entry
    const ledgerEntry = await StockLedger.create({
      sku,
      warehouse,
      location,
      movementType,
      quantity: Math.abs(quantity),
      batchNumber,
      expiryDate,
      referenceType,
      referenceId,
      balanceQuantity: newBalance,
      user,
      remarks
    });

    return ledgerEntry;
  }

  // Get stock movements history
  async getStockHistory(skuId, warehouseId, limit = 50) {
    const query = { sku: skuId };
    if (warehouseId) query.warehouse = warehouseId;

    return await StockLedger.find(query)
      .sort({ transactionDate: -1 })
      .limit(limit)
      .populate('sku', 'skuCode name')
      .populate('warehouse', 'code name')
      .populate('user', 'name email');
  }

  // Check if SKU is below reorder point
  async checkReorderPoint(skuId, warehouseId) {
    const sku = await SKU.findById(skuId);
    if (!sku) throw new Error('SKU not found');

    const currentStock = await this.getCurrentStock(skuId, warehouseId);
    
    return {
      needsReorder: currentStock <= sku.minStock,
      currentStock,
      minStock: sku.minStock,
      safetyStock: sku.safetyStock,
      recommendedOrderQty: Math.max(sku.maxStock - currentStock, 0)
    };
  }

  // Get SKUs below reorder point across all warehouses
  async getSKUsBelowReorderPoint(warehouseId = null) {
    const skus = await SKU.find({ isActive: true });
    const belowReorderPoint = [];

    for (const sku of skus) {
      const checkWarehouse = warehouseId || sku.defaultWarehouse;
      if (!checkWarehouse) continue;

      const currentStock = await this.getCurrentStock(sku._id, checkWarehouse);
      
      if (currentStock <= sku.minStock) {
        belowReorderPoint.push({
          sku: sku._id,
          skuCode: sku.skuCode,
          name: sku.name,
          warehouse: checkWarehouse,
          currentStock,
          minStock: sku.minStock,
          safetyStock: sku.safetyStock,
          recommendedOrderQty: sku.maxStock - currentStock,
          urgency: currentStock <= sku.safetyStock ? 'URGENT' : 'HIGH'
        });
      }
    }

    return belowReorderPoint;
  }

  // Reserve stock for order
  async reserveStock(orderId, items, warehouseId, userId) {
    const reservations = [];

    for (const item of items) {
      const currentStock = await this.getCurrentStock(item.sku, warehouseId);
      
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for SKU ${item.sku}. Available: ${currentStock}, Required: ${item.quantity}`);
      }

      // Create outward movement for reservation
      const ledgerEntry = await this.recordMovement({
        sku: item.sku,
        warehouse: warehouseId,
        movementType: 'OUTWARD',
        quantity: item.quantity,
        referenceType: 'ORDER',
        referenceId: orderId,
        user: userId,
        remarks: 'Stock reserved for order'
      });

      reservations.push(ledgerEntry);
    }

    return reservations;
  }
}

module.exports = new StockService();
