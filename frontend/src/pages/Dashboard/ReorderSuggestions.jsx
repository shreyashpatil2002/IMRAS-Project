import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import reportService from '../../services/reportService';
import prService from '../../services/prService';
import warehouseService from '../../services/warehouseService';
import authService from '../../services/authService';

const ReorderSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // Auto-select warehouse for non-admin users
    if (currentUser?.assignedWarehouse && currentUser.role !== 'ADMIN') {
      setSelectedWarehouse(currentUser.assignedWarehouse);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [selectedWarehouse, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Determine which warehouse to query
      const warehouseToQuery = user?.role === 'ADMIN' 
        ? (selectedWarehouse || null) 
        : (user?.assignedWarehouse || selectedWarehouse || null);

      const [suggestionsRes, warehousesRes] = await Promise.all([
        reportService.getReorderSuggestions(warehouseToQuery),
        warehouseService.getAllWarehouses()
      ]);
      
      const suggestionsData = suggestionsRes.data?.suggestions || suggestionsRes.suggestions || [];
      const warehousesData = warehousesRes.data?.warehouses || warehousesRes.warehouses || [];
      
      // Filter warehouses for non-admin users
      const filteredWarehouses = user?.role === 'ADMIN' 
        ? warehousesData
        : warehousesData.filter(wh => wh._id === user?.assignedWarehouse);

      setSuggestions(suggestionsData);
      setWarehouses(filteredWarehouses);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (index) => {
    const suggestion = suggestions[index];
    // Don't allow selection if PR is already pending
    if (suggestion.hasPendingPR) return;
    
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

    const warehouseToUse = selectedWarehouse || user?.assignedWarehouse;
    
    if (!warehouseToUse) {
      alert('Please select a warehouse');
      return;
    }

    try {
      const selectedSuggestions = selectedItems.map(index => ({
        sku: suggestions[index].sku._id,
        requestedQuantity: suggestions[index].recommendedOrderQty,
        urgency: suggestions[index].urgency,
        remarks: `Auto-generated reorder: Current stock ${suggestions[index].currentStock}, Min stock ${suggestions[index].minStock}`
      }));

      await reportService.createDraftPR(selectedSuggestions, warehouseToUse);
      alert('Draft PR created successfully! You can review it in Purchase Requisitions page.');
      setSelectedItems([]);
      fetchData();
    } catch (error) {
      console.error('Error creating PR:', error);
      alert(error.response?.data?.message || 'Failed to create draft PR');
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      URGENT: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
      HIGH: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      MEDIUM: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      LOW: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
    };
    return colors[urgency] || 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
  };

  return (
    <DashboardLayout title="Reorder Suggestions">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Auto Reorder Suggestions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">System-generated reorder recommendations based on stock levels</p>
        </div>

        {/* Filters & Actions */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Warehouse
              </label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                disabled={user?.role !== 'ADMIN'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {user?.role === 'ADMIN' && <option value="">All Warehouses</option>}
                {warehouses.map(wh => (
                  <option key={wh._id} value={wh._id}>{wh.name} ({wh.code})</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={handleCreateDraftPR}
                disabled={selectedItems.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Create Draft PR {selectedItems.length > 0 && `(${selectedItems.length})`}
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions Table */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Analyzing stock levels...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length > 0 && selectedItems.length === suggestions.filter(s => !s.hasPendingPR).length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Select only items without pending PR
                            const selectableIndexes = suggestions
                              .map((s, i) => (!s.hasPendingPR ? i : null))
                              .filter(i => i !== null);
                            setSelectedItems(selectableIndexes);
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 tracking-wider">SKU Code</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 tracking-wider">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 tracking-wider">Warehouse</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase text-gray-600 dark:text-gray-300 tracking-wider">Current</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase text-gray-600 dark:text-gray-300 tracking-wider">Min Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase text-gray-600 dark:text-gray-300 tracking-wider">Order Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 tracking-wider">Urgency</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase text-gray-600 dark:text-gray-300 tracking-wider">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {suggestions.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">
                              check_circle
                            </span>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              All Stock Levels Healthy
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No items need reordering at this time. All inventory is above minimum stock levels.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${suggestion.hasPendingPR ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(index)}
                            onChange={() => toggleItemSelection(index)}
                            disabled={suggestion.hasPendingPR}
                            className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary disabled:opacity-30 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                              {suggestion.sku?.skuCode}
                            </span>
                            {suggestion.hasPendingPR && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                PR Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {suggestion.sku?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {suggestion.sku?.unit}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {suggestion.warehouseName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">
                            {suggestion.currentStock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {suggestion.minStock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-primary">
                            {suggestion.recommendedOrderQty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(suggestion.urgency)}`}>
                            {suggestion.urgency}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {suggestion.supplier?.name || 'No Supplier'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {suggestion.totalCost?.toFixed(2) || '0.00'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        {suggestions.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
                info
              </span>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">About Reorder Suggestions</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span>Recommendations calculated from actual batch quantities in each warehouse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span><strong>URGENT:</strong> Out of stock or below safety stock | <strong>HIGH:</strong> Below minimum stock | <strong>MEDIUM:</strong> Approaching minimum</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span>Estimated costs include volume-based pricing tiers from suppliers when available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span><strong className="text-blue-700 dark:text-blue-300">PR Pending</strong> badge indicates a purchase requisition already exists for this SKU (Draft, Submitted, or Approved)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span>Select items and click "Create Draft PR" to generate a purchase requisition for approval</span>
                  </li>
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
