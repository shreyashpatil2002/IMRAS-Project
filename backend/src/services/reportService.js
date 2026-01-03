const SKU = require('../models/SKU');
const StockLedger = require('../models/StockLedger');
const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseRequisition = require('../models/PurchaseRequisition');
const Order = require('../models/Order');
const stockService = require('./stockService');

class ReportService {
  // ABC Analysis - categorize SKUs by value
  async abcAnalysis() {
    const StockLedger = require('../models/StockLedger');
    
    // Get all SKUs with their consumption
    const skus = await SKU.find({ isActive: true });
    const skuAnalysis = [];

    for (const sku of skus) {
      // Get outward movements in last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const movements = await StockLedger.find({
        sku: sku._id,
        movementType: { $in: ['OUTWARD', 'TRANSFER_OUT'] },
        transactionDate: { $gte: twelveMonthsAgo }
      });

      const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);
      const annualValue = totalQuantity * sku.unitCost;

      skuAnalysis.push({
        sku: sku._id,
        skuCode: sku.skuCode,
        name: sku.name,
        annualConsumption: totalQuantity,
        unitCost: sku.unitCost,
        annualValue
      });
    }

    // Sort by annual value descending
    skuAnalysis.sort((a, b) => b.annualValue - a.annualValue);

    // Calculate cumulative percentages
    const totalValue = skuAnalysis.reduce((sum, item) => sum + item.annualValue, 0);
    let cumulativeValue = 0;

    const categorizedSkus = skuAnalysis.map(item => {
      cumulativeValue += item.annualValue;
      const cumulativePercentage = (cumulativeValue / totalValue) * 100;

      let category;
      if (cumulativePercentage <= 70) {
        category = 'A'; // High value - 70% of total value
      } else if (cumulativePercentage <= 90) {
        category = 'B'; // Medium value - 20% of total value
      } else {
        category = 'C'; // Low value - 10% of total value
      }

      return {
        ...item,
        category,
        valuePercentage: (item.annualValue / totalValue) * 100,
        cumulativePercentage
      };
    });

    return {
      analysis: categorizedSkus,
      summary: {
        totalSKUs: skuAnalysis.length,
        categoryA: categorizedSkus.filter(s => s.category === 'A').length,
        categoryB: categorizedSkus.filter(s => s.category === 'B').length,
        categoryC: categorizedSkus.filter(s => s.category === 'C').length,
        totalValue
      }
    };
  }

  // Stock Ageing Report
  async stockAgeingReport(warehouseId = null) {
    const query = {};
    if (warehouseId) query.warehouse = warehouseId;

    // Get latest stock movements with expiry dates
    const movements = await StockLedger.find({
      ...query,
      expiryDate: { $exists: true, $ne: null },
      movementType: 'INWARD'
    })
      .populate('sku', 'skuCode name')
      .populate('warehouse', 'code name')
      .sort({ expiryDate: 1 });

    const now = new Date();
    const ageingData = movements.map(movement => {
      const daysUntilExpiry = Math.floor((movement.expiryDate - now) / (1000 * 60 * 60 * 24));
      
      let ageCategory;
      if (daysUntilExpiry < 0) {
        ageCategory = 'Expired';
      } else if (daysUntilExpiry <= 30) {
        ageCategory = 'Expiring Soon (0-30 days)';
      } else if (daysUntilExpiry <= 90) {
        ageCategory = 'Medium Age (31-90 days)';
      } else if (daysUntilExpiry <= 180) {
        ageCategory = 'Good (91-180 days)';
      } else {
        ageCategory = 'Fresh (>180 days)';
      }

      return {
        sku: movement.sku,
        warehouse: movement.warehouse,
        batchNumber: movement.batchNumber,
        expiryDate: movement.expiryDate,
        daysUntilExpiry,
        ageCategory,
        quantity: movement.balanceQuantity
      };
    });

    return ageingData;
  }

  // Inventory Turnover Ratio
  async inventoryTurnoverRatio(skuId = null, months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const query = { transactionDate: { $gte: startDate } };
    if (skuId) query.sku = skuId;

    // Calculate COGS (Cost of Goods Sold) - sum of outward movements
    const outwardMovements = await StockLedger.find({
      ...query,
      movementType: 'OUTWARD'
    }).populate('sku', 'unitCost');

    const cogs = outwardMovements.reduce((sum, m) => {
      return sum + (m.quantity * (m.sku?.unitCost || 0));
    }, 0);

    // Calculate average inventory value
    let avgInventoryValue;
    
    if (skuId) {
      const sku = await SKU.findById(skuId);
      const currentStock = await stockService.getTotalStock(skuId);
      avgInventoryValue = currentStock * sku.unitCost;
    } else {
      const skus = await SKU.find({ isActive: true });
      let totalInventoryValue = 0;
      
      for (const sku of skus) {
        const stock = await stockService.getTotalStock(sku._id);
        totalInventoryValue += stock * sku.unitCost;
      }
      
      avgInventoryValue = totalInventoryValue;
    }

    const turnoverRatio = avgInventoryValue > 0 ? cogs / avgInventoryValue : 0;
    const daysInventory = turnoverRatio > 0 ? 365 / turnoverRatio : 0;

    return {
      cogs,
      avgInventoryValue,
      turnoverRatio: turnoverRatio.toFixed(2),
      daysInventory: Math.round(daysInventory),
      period: `${months} months`
    };
  }

  // Stock value report
  async stockValueReport(warehouseId = null) {
    const skus = await SKU.find({ isActive: true });
    const stockData = [];
    let totalValue = 0;

    for (const sku of skus) {
      let quantity;
      if (warehouseId) {
        quantity = await stockService.getCurrentStock(sku._id, warehouseId);
      } else {
        quantity = await stockService.getTotalStock(sku._id);
      }

      const value = quantity * sku.unitCost;
      totalValue += value;

      if (quantity > 0) {
        stockData.push({
          sku: sku._id,
          skuCode: sku.skuCode,
          name: sku.name,
          quantity,
          unitCost: sku.unitCost,
          totalValue: value,
          category: sku.category
        });
      }
    }

    return {
      items: stockData.sort((a, b) => b.totalValue - a.totalValue),
      totalValue,
      totalItems: stockData.length
    };
  }

  // Supplier performance report
  async supplierPerformanceReport() {
    const Supplier = require('../models/Supplier');
    
    const suppliers = await Supplier.find({ status: 'Active' });
    const performanceData = [];

    for (const supplier of suppliers) {
      // Get all POs for this supplier
      const pos = await PurchaseOrder.find({ supplier: supplier._id });
      
      const totalPOs = pos.length;
      const completedPOs = pos.filter(po => po.status === 'RECEIVED').length;
      const onTimePOs = pos.filter(po => {
        if (po.status === 'RECEIVED' && po.expectedDeliveryDate && po.actualDeliveryDate) {
          return po.actualDeliveryDate <= po.expectedDeliveryDate;
        }
        return false;
      }).length;

      const totalAmount = pos.reduce((sum, po) => sum + po.totalAmount, 0);
      const avgLeadTime = pos
        .filter(po => po.sentDate && po.actualDeliveryDate)
        .reduce((sum, po, idx, arr) => {
          const days = Math.floor((po.actualDeliveryDate - po.sentDate) / (1000 * 60 * 60 * 24));
          return sum + days / arr.length;
        }, 0);

      performanceData.push({
        supplier: supplier._id,
        name: supplier.name,
        totalPOs,
        completedPOs,
        onTimePOs,
        onTimeDeliveryRate: totalPOs > 0 ? ((onTimePOs / totalPOs) * 100).toFixed(2) : 0,
        totalAmount,
        avgLeadTime: Math.round(avgLeadTime),
        rating: supplier.rating
      });
    }

    return performanceData.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  // Order fulfillment report
  async orderFulfillmentReport(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.find({
      orderDate: { $gte: startDate }
    });

    const totalOrders = orders.length;
    const fulfilledOrders = orders.filter(o => ['DELIVERED', 'CLOSED'].includes(o.status)).length;
    const pendingOrders = orders.filter(o => ['PENDING', 'RESERVED', 'PICKED'].includes(o.status)).length;
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;

    // Calculate average fulfillment time
    const fulfilledWithDates = orders.filter(o => 
      o.status === 'DELIVERED' && o.orderDate && o.deliveredDate
    );
    
    const avgFulfillmentTime = fulfilledWithDates.reduce((sum, order, idx, arr) => {
      const days = Math.floor((order.deliveredDate - order.orderDate) / (1000 * 60 * 60 * 24));
      return sum + days / arr.length;
    }, 0);

    return {
      period: `${days} days`,
      totalOrders,
      fulfilledOrders,
      pendingOrders,
      cancelledOrders,
      fulfillmentRate: totalOrders > 0 ? ((fulfilledOrders / totalOrders) * 100).toFixed(2) : 0,
      avgFulfillmentTime: Math.round(avgFulfillmentTime)
    };
  }

  // Create Draft PR from Reorder Suggestions
  async createDraftPR(items, warehouseId, userId) {
    // Create PR items array
    const prItems = items.map(item => ({
      sku: item.sku,
      requestedQuantity: item.requestedQuantity,
      urgency: item.urgency || 'MEDIUM'
    }));

    // Create the PR
    const pr = await PurchaseRequisition.create({
      prNumber: `PR-${Date.now()}`, // Generate PR number
      warehouse: warehouseId,
      requestedBy: userId,
      items: prItems,
      status: 'DRAFT',
      notes: 'Auto-generated from reorder suggestions'
    });

    return pr;
  }
}

module.exports = new ReportService();
