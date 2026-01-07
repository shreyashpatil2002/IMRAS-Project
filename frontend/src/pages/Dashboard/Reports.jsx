import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import reportService from '../../services/reportService';
import warehouseService from '../../services/warehouseService';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseService.getAllWarehouses();
      setWarehouses(response.warehouses || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const reports = [
    { id: 'reorder', title: 'Reorder Suggestions', desc: 'SKUs that need restocking', icon: 'notification_important', color: 'orange' },
    { id: 'abc', title: 'ABC Analysis', desc: 'Categorize inventory by value', icon: 'category', color: 'blue' },
    { id: 'ageing', title: 'Stock Ageing Report', desc: 'Track expiry dates and aging', icon: 'schedule', color: 'yellow' },
    { id: 'turnover', title: 'Inventory Turnover', desc: 'Stock rotation efficiency', icon: 'sync_alt', color: 'green' },
    { id: 'stock-value', title: 'Stock Valuation', desc: 'Current inventory value', icon: 'paid', color: 'purple' },
    { id: 'supplier', title: 'Supplier Performance', desc: 'Delivery and quality metrics', icon: 'local_shipping', color: 'indigo' },
    { id: 'fulfillment', title: 'Order Fulfillment', desc: 'Order completion statistics', icon: 'trending_up', color: 'green' }
  ];

  const generateReport = async (reportId) => {
    try {
      setLoading(true);
      setActiveReport(reportId);
      let data;
      
      switch(reportId) {
        case 'reorder':
          data = await reportService.getReorderSuggestions(selectedWarehouse || null);
          break;
        case 'abc':
          data = await reportService.getABCAnalysis();
          break;
        case 'ageing':
          data = await reportService.getStockAgeingReport(selectedWarehouse || null);
          break;
        case 'turnover':
          data = await reportService.getTurnoverRatio(null, dateRange / 30 || 12);
          break;
        case 'stock-value':
          data = await reportService.getStockValueReport(selectedWarehouse || null);
          break;
        case 'supplier':
          data = await reportService.getSupplierPerformance();
          break;
        case 'fulfillment':
          data = await reportService.getOrderFulfillmentReport(dateRange || 30);
          break;
        default:
          data = null;
      }
      
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;
    
    let csvContent = '';
    const report = reports.find(r => r.id === activeReport);
    
    if (activeReport === 'reorder') {
      csvContent = 'SKU Code,Product Name,Current Stock,Reorder Point,Suggested Quantity,Urgency\n';
      reportData.suggestions?.forEach(item => {
        csvContent += `${item.sku.skuCode},${item.sku.name},${item.currentStock},${item.reorderPoint},${item.suggestedQuantity},${item.urgency}\n`;
      });
    } else if (activeReport === 'abc') {
      csvContent = 'SKU Code,Product Name,Annual Consumption,Unit Cost,Annual Value,Category,Value %\n';
      reportData.analysis?.forEach(item => {
        csvContent += `${item.skuCode},${item.name},${item.annualConsumption},${item.unitCost},${item.annualValue.toFixed(2)},${item.category},${item.valuePercentage.toFixed(2)}%\n`;
      });
    } else if (activeReport === 'stock-value') {
      csvContent = 'SKU Code,Product Name,Quantity,Unit Cost,Total Value,Category\n';
      reportData.items?.forEach(item => {
        csvContent += `${item.skuCode},${item.name},${item.quantity},${item.unitCost},${item.totalValue.toFixed(2)},${item.category}\n`;
      });
    } else if (activeReport === 'supplier') {
      csvContent = 'Supplier,Total POs,Completed POs,On-Time POs,On-Time Rate,Total Amount,Avg Lead Time,Rating\n';
      reportData.forEach(item => {
        csvContent += `${item.name},${item.totalPOs},${item.completedPOs},${item.onTimePOs},${item.onTimeDeliveryRate}%,${item.totalAmount},${item.avgLeadTime} days,${item.rating}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report?.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch(activeReport) {
      case 'reorder':
        return renderReorderReport();
      case 'abc':
        return renderABCReport();
      case 'ageing':
        return renderAgeingReport();
      case 'turnover':
        return renderTurnoverReport();
      case 'stock-value':
        return renderStockValueReport();
      case 'supplier':
        return renderSupplierReport();
      case 'fulfillment':
        return renderFulfillmentReport();
      default:
        return null;
    }
  };

  const renderReorderReport = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="text-sm text-orange-600 dark:text-orange-400">Critical Items</div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {reportData.suggestions?.filter(s => s.urgency === 'HIGH').length || 0}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Medium Priority</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {reportData.suggestions?.filter(s => s.urgency === 'MEDIUM').length || 0}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400">Low Priority</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {reportData.suggestions?.filter(s => s.urgency === 'LOW').length || 0}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SKU Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Current Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reorder Point</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Suggested Qty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Urgency</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reportData.suggestions?.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.sku.skuCode}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.sku.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.currentStock}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.reorderPoint}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.suggestedQuantity}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.urgency === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    item.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {item.urgency}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderABCReport = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400">Total SKUs</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {reportData.summary?.totalSKUs || 0}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400">Category A (70%)</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {reportData.summary?.categoryA || 0}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Category B (20%)</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {reportData.summary?.categoryB || 0}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Category C (10%)</div>
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {reportData.summary?.categoryC || 0}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SKU Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Annual Consumption</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Unit Cost</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Annual Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Value %</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reportData.analysis?.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.skuCode}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.annualConsumption}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.unitCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.annualValue.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.valuePercentage.toFixed(2)}%</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.category === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    item.category === 'B' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {item.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAgeingReport = () => {
    const ageingData = reportData.ageingReport || reportData || [];
    return (
      <div>
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SKU Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Warehouse</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Batch Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expiry Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Days Until Expiry</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {ageingData.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.sku?.skuCode}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.sku?.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.warehouse?.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.batchNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(item.expiryDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.daysUntilExpiry}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.ageCategory === 'Expired' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    item.ageCategory.includes('0-30') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    item.ageCategory.includes('31-90') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {item.ageCategory}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    );
  };

  const renderTurnoverReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400">COGS</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {reportData.cogs?.toFixed(2) || 0}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-sm text-purple-600 dark:text-purple-400">Avg Inventory Value</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {reportData.avgInventoryValue?.toFixed(2) || 0}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400">Turnover Ratio</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {reportData.turnoverRatio || 0}
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="text-sm text-orange-600 dark:text-orange-400">Days of Inventory</div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {reportData.daysInventory || 0}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Report Summary</h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>Period:</strong> {reportData.period}</p>
          <p><strong>Cost of Goods Sold (COGS):</strong> {reportData.cogs?.toFixed(2) || 0}</p>
          <p><strong>Average Inventory Value:</strong> {reportData.avgInventoryValue?.toFixed(2) || 0}</p>
          <p><strong>Inventory Turnover Ratio:</strong> {reportData.turnoverRatio || 0} times</p>
          <p><strong>Days of Inventory:</strong> {reportData.daysInventory || 0} days</p>
          <p className="mt-4 text-gray-600 dark:text-gray-400 italic">
            Higher turnover ratio indicates faster inventory movement and better efficiency.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStockValueReport = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-sm text-purple-600 dark:text-purple-400">Total Inventory Value</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {reportData.totalValue?.toFixed(2) || 0}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Items</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {reportData.totalItems || 0}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SKU Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Unit Cost</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reportData.items?.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.skuCode}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.unitCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.totalValue.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSupplierReport = () => {
    const suppliers = reportData.performance || reportData || [];
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total POs</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Completed</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">On-Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">On-Time Rate</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Avg Lead Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {suppliers.map((item, idx) => (
            <tr key={idx}>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.totalPOs}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.completedPOs}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.onTimePOs}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  parseFloat(item.onTimeDeliveryRate) >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  parseFloat(item.onTimeDeliveryRate) >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {item.onTimeDeliveryRate}%
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.totalAmount.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.avgLeadTime} days</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-yellow-500 text-sm mr-1">star</span>
                  {item.rating || 'N/A'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    );
  };

  const renderFulfillmentReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Orders</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {reportData.totalOrders || 0}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400">Fulfilled</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {reportData.fulfilledOrders || 0}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {reportData.pendingOrders || 0}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="text-sm text-red-600 dark:text-red-400">Cancelled</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {reportData.cancelledOrders || 0}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-sm text-purple-600 dark:text-purple-400">Fulfillment Rate</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {reportData.fulfillmentRate || 0}%
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Performance Metrics</h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>Report Period:</strong> {reportData.period}</p>
          <p><strong>Average Fulfillment Time:</strong> {reportData.avgFulfillmentTime || 0} days</p>
          <p><strong>Success Rate:</strong> {reportData.fulfillmentRate || 0}%</p>
          <p className="mt-4 text-gray-600 dark:text-gray-400 italic">
            {parseFloat(reportData.fulfillmentRate) >= 90 
              ? 'Excellent performance! Keep up the great work.' 
              : 'Consider optimizing the fulfillment process to improve efficiency.'}
          </p>
        </div>
      </div>
    </div>
  );

  const getColorClass = (color) => {
    const colors = {
      orange: 'bg-orange-100 text-orange-600',
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive analytics for your inventory</p>
        </div>

        {/* Filters */}
        {!activeReport && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Warehouse Filter
                </label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Warehouses</option>
                  {warehouses.map(wh => (
                    <option key={wh._id} value={wh._id}>{wh.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range (Days)
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                  <option value={180}>Last 180 Days</option>
                  <option value={365}>Last Year</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Report Cards */}
        {!activeReport && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => generateReport(report.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getColorClass(report.color)}`}>
                    <span className="material-symbols-outlined text-[24px]">
                      {report.icon}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-primary">
                    <span className="material-symbols-outlined">description</span>
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {report.desc}
                </p>
                <button className="text-sm font-medium text-primary hover:underline">
                  Generate Report →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Report Display Area */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Generating report...</p>
          </div>
        )}

        {!loading && reportData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {reports.find(r => r.id === activeReport)?.title}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Export CSV
                </button>
                <button
                  onClick={() => { setActiveReport(null); setReportData(null); }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                  Close
                </button>
              </div>
            </div>
            
            {/* Display report content based on type */}
            {renderReportContent()}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
