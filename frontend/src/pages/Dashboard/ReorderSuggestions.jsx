import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import reportService from '../../services/reportService';
import prService from '../../services/prService';
import warehouseService from '../../services/warehouseService';

const ReorderSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedWarehouse]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suggestionsRes, warehousesRes] = await Promise.all([
        reportService.getReorderSuggestions(selectedWarehouse || null),
        warehouseService.getAllWarehouses()
      ]);
      setSuggestions(suggestionsRes.data || []);
      setWarehouses(warehousesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const handleCreateDraftPR = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    if (!selectedWarehouse) {
      alert('Please select a warehouse');
      return;
    }

    try {
      const selectedSuggestions = selectedItems.map(index => ({
        sku: suggestions[index].sku._id,
        requestedQuantity: suggestions[index].recommendedOrderQty,
        urgency: suggestions[index].urgency
      }));

      await reportService.createDraftPR(selectedSuggestions, selectedWarehouse);
      alert('Draft PR created successfully! You can review it in Purchase Requisitions.');
      setSelectedItems([]);
      fetchData();
    } catch (error) {
      console.error('Error creating PR:', error);
      alert(error.response?.data?.message || 'Failed to create PR');
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      URGENT: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Auto Reorder Suggestions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">System-generated reorder recommendations based on stock levels</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Warehouse
              </label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">All Warehouses</option>
                {warehouses.map(wh => (
                  <option key={wh._id} value={wh._id}>{wh.name}</option>
                ))}
              </select>
            </div>
            {selectedItems.length > 0 && (
              <div className="flex items-end">
                <button
                  onClick={handleCreateDraftPR}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Draft PR ({selectedItems.length} items)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Analyzing stock levels...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === suggestions.length && suggestions.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(suggestions.map((_, i) => i));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="w-4 h-4 text-primary rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Min Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Recommended Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Est. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {suggestions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="bg-green-100 dark:bg-green-900/20 inline-block px-6 py-3 rounded-lg">
                        <p className="text-green-800 dark:text-green-200">
                          ✓ All items are adequately stocked. No reorder needed at this time.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(index)}
                          onChange={() => toggleItemSelection(index)}
                          className="w-4 h-4 text-primary rounded"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.sku?.skuCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {suggestion.sku?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 font-semibold">
                        {suggestion.currentStock}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {suggestion.minStock}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">
                        {suggestion.recommendedOrderQty}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(suggestion.urgency)}`}>
                          {suggestion.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {suggestion.supplier?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        ${suggestion.totalCost?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Info Box */}
        {suggestions.length > 0 && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">About Reorder Suggestions</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Recommendations are based on current stock vs. minimum stock levels</li>
                  <li>• Urgency levels: URGENT (below safety stock), HIGH (below min stock), MEDIUM/LOW (approaching min stock)</li>
                  <li>• Estimated costs include volume-based pricing tiers from suppliers</li>
                  <li>• Select items and click "Create Draft PR" to generate a purchase requisition</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReorderSuggestions;
