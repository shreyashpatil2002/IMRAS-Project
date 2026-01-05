import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import batchService from '../../services/batchService';
import authService from '../../services/authService';

const BatchTracking = () => {
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState({ totalBatches: 0, active: 0, lowStock: 0, expiringSoon: 0, depleted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [adjustData, setAdjustData] = useState({
    batchId: null,
    adjustment: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchBatches();
  }, [filterStatus, searchQuery]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;
      
      const response = await batchService.getAllBatches(params);
      let batchData = response.data?.batches || response.batches || [];
      
      // Filter by assigned warehouse for non-admin users
      if (currentUser?.role !== 'ADMIN' && currentUser?.assignedWarehouse) {
        batchData = batchData.filter(batch => {
          const batchWarehouseId = batch.warehouse?._id || batch.warehouse;
          return batchWarehouseId === currentUser.assignedWarehouse;
        });
      }
      
      setBatches(batchData);
      
      // Calculate stats from fetched data
      const statsData = {
        totalBatches: batchData.length,
        active: batchData.filter(b => b.status === 'Active').length,
        lowStock: batchData.filter(b => b.status === 'Low Stock').length,
        expiringSoon: batchData.filter(b => b.status === 'Expiring Soon').length,
        depleted: batchData.filter(b => b.status === 'Depleted').length
      };
      setStats(statsData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryText = (days) => {
    if (days === null) return 'N/A';
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days`;
  };

  const handleAdjustQuantity = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submission
    
    try {
      setSubmitting(true);
      setError('');
      const response = await batchService.adjustBatchQuantity(adjustData.batchId, {
        adjustment: parseInt(adjustData.adjustment),
        reason: adjustData.reason,
        notes: adjustData.notes
      });
      
      // Show success message
      alert(`Batch quantity adjusted successfully! Previous: ${response.data.adjustment.oldQuantity}, New: ${response.data.adjustment.newQuantity}`);
      
      setShowAdjustModal(false);
      setAdjustData({ batchId: null, adjustment: '', reason: '', notes: '' });
      await fetchBatches();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to adjust quantity');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Low Stock': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'Expiring Soon': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Depleted': return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
      case 'Expired': return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStockPercentage = (current, initial) => {
    return (current / initial) * 100;
  };

  return (
    <DashboardLayout title="Batch/Lot Tracking">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0d121b] dark:text-white">
              Batch/Lot Tracking
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track and manage product batches with detailed lot information
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">layers</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#0d121b] dark:text-white mb-1">{stats.totalBatches}</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Batches</p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.active}</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">warning</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{stats.lowStock}</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Low Stock</p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">schedule</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{stats.expiringSoon}</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Expiring Soon</p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">block</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-1">{stats.depleted}</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Depleted</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by batch number, product name, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
                <option value="Depleted">Depleted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batch Table */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Batch Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Received Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Warehouse & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading batches...</p>
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No batches found
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => {
                    const daysToExpiry = getDaysUntilExpiry(batch.expiryDate);
                    return (
                      <tr key={batch._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-[#0d121b] dark:text-white">
                            {batch.batchNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#0d121b] dark:text-white">
                              {batch.product?.name || 'N/A'}
                            </span>
                            {batch.product?.sku && (
                              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded mt-1 inline-block w-fit">
                                {batch.product.sku}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(batch.receivedDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {formatDate(batch.expiryDate)}
                            </span>
                            <span className={`text-xs mt-1 ${
                              daysToExpiry < 0 ? 'text-red-600 dark:text-red-400' :
                              daysToExpiry <= 30 ? 'text-orange-600 dark:text-orange-400' :
                              daysToExpiry <= 90 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-green-600 dark:text-green-400'
                            }`}>
                              {getExpiryText(daysToExpiry)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                                warehouse
                              </span>
                              <span className="text-sm font-medium text-[#0d121b] dark:text-white">
                                {batch.warehouse?.name || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-gray-400">
                                location_on
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {batch.location}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-[#0d121b] dark:text-white">
                                {batch.currentQuantity} / {batch.initialQuantity}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  getStockPercentage(batch.currentQuantity, batch.initialQuantity) > 50
                                    ? 'bg-green-500'
                                    : getStockPercentage(batch.currentQuantity, batch.initialQuantity) > 20
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${getStockPercentage(batch.currentQuantity, batch.initialQuantity)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(batch.status)}`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedBatch(batch)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-primary transition-colors"
                              title="View Details"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            <button
                              onClick={() => {
                                setAdjustData({ ...adjustData, batchId: batch._id });
                                setShowAdjustModal(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                              title="Adjust Quantity"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Batch Details Modal */}
        {selectedBatch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-surface-light dark:bg-surface-dark z-10">
                <div>
                  <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">
                    Batch Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedBatch.batchNumber}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Product Name
                    </p>
                    <p className="text-base font-semibold text-[#0d121b] dark:text-white">
                      {selectedBatch.product?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      SKU
                    </p>
                    <p className="text-base font-mono font-semibold text-[#0d121b] dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded inline-block">
                      {selectedBatch.product?.sku || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Supplier
                    </p>
                    <p className="text-base text-[#0d121b] dark:text-white">
                      {selectedBatch.supplier?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Received Date
                    </p>
                    <p className="text-base text-[#0d121b] dark:text-white">
                      {formatDate(selectedBatch.receivedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Expiry Date
                    </p>
                    <p className="text-base text-[#0d121b] dark:text-white">
                      {formatDate(selectedBatch.expiryDate)}
                      <span className={`block text-xs mt-1 ${
                        getDaysUntilExpiry(selectedBatch.expiryDate) < 0 ? 'text-red-600' :
                        getDaysUntilExpiry(selectedBatch.expiryDate) <= 30 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {getExpiryText(getDaysUntilExpiry(selectedBatch.expiryDate))}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Warehouse & Location
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                          warehouse
                        </span>
                        <span className="text-base font-medium text-[#0d121b] dark:text-white">
                          {selectedBatch.warehouse?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-gray-400">
                          location_on
                        </span>
                        <span className="text-base text-[#0d121b] dark:text-white">
                          {selectedBatch.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Status
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedBatch.status)}`}>
                      {selectedBatch.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Stock Level
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Quantity</span>
                      <span className="text-lg font-bold text-[#0d121b] dark:text-white">{selectedBatch.currentQuantity}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Initial Quantity</span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{selectedBatch.initialQuantity}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          getStockPercentage(selectedBatch.currentQuantity, selectedBatch.initialQuantity) > 50
                            ? 'bg-green-500'
                            : getStockPercentage(selectedBatch.currentQuantity, selectedBatch.initialQuantity) > 20
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${getStockPercentage(selectedBatch.currentQuantity, selectedBatch.initialQuantity)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {getStockPercentage(selectedBatch.currentQuantity, selectedBatch.initialQuantity).toFixed(1)}% remaining
                    </p>
                  </div>
                </div>
                <div className="flex pt-4">
                  <button
                    onClick={() => {
                      setAdjustData({ ...adjustData, batchId: selectedBatch._id });
                      setShowAdjustModal(true);
                      setSelectedBatch(null);
                    }}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors"
                  >
                    Adjust Quantity
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Adjust Quantity Modal */}
        {showAdjustModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">
                    Adjust Quantity
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Modify batch stock level
                  </p>
                </div>
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form
                onSubmit={handleAdjustQuantity}
                className="p-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adjustment Type *
                    </label>
                    <select
                      required
                      value={adjustData.reason}
                      onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value, adjustment: '' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select reason</option>
                      <option value="damaged">Damaged/Lost (Remove Stock)</option>
                      <option value="returned">Customer Return (Add Stock)</option>
                      <option value="adjustment">Manual Adjustment (Add/Remove)</option>
                    </select>
                  </div>
                  {adjustData.reason && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {adjustData.reason === 'damaged' && (
                          <>📉 <strong>Damaged/Lost:</strong> Enter negative value (e.g., -10 to remove 10 units)</>
                        )}
                        {adjustData.reason === 'returned' && (
                          <>📈 <strong>Customer Return:</strong> Enter positive value (e.g., +20 to add 20 returned units)</>
                        )}
                        {adjustData.reason === 'adjustment' && (
                          <>⚖️ <strong>Manual Adjustment:</strong> Use +/- as needed (e.g., +50 to add, -30 to remove)</>
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity Change *
                    </label>
                    <input
                      type="number"
                      required
                      value={adjustData.adjustment}
                      onChange={(e) => setAdjustData({ ...adjustData, adjustment: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={
                        adjustData.reason === 'damaged' ? 'e.g., -10' :
                        adjustData.reason === 'returned' ? 'e.g., +20' :
                        'Use + for increase, - for decrease'
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Current Stock: {selectedBatch?.currentQuantity || 0} units | Initial: {selectedBatch?.initialQuantity || 0} units
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={adjustData.notes}
                      onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Additional information (optional)"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {submitting ? 'Updating...' : 'Update Quantity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BatchTracking;
