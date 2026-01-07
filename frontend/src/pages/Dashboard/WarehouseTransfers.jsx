import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import transferService from '../../services/transferService';
import warehouseService from '../../services/warehouseService';
import skuService from '../../services/skuService';
import authService from '../../services/authService';
import batchService from '../../services/batchService';

const WarehouseTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [skus, setSKUs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTransfer, setViewTransfer] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [user, setUser] = useState(null);
  const [availableBatches, setAvailableBatches] = useState({});
  const [loadingBatches, setLoadingBatches] = useState({});
  
  const [formData, setFormData] = useState({
    sourceWarehouse: '',
    destinationWarehouse: '',
    items: [{ sku: '', selectedBatch: null, batchNumber: '', quantity: '', expiryDate: '' }],
    notes: ''
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchData();
  }, [statusFilter]);

  useEffect(() => {
    // Auto-select source warehouse when modal opens for non-admin users
    if (showModal && user) {
      if (user.role !== 'ADMIN' && user.assignedWarehouse) {
        setFormData(prev => ({
          ...prev,
          sourceWarehouse: user.assignedWarehouse
        }));
      }
    }
  }, [showModal, user, warehouses]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const [transfersRes, warehousesRes, skusRes] = await Promise.all([
        transferService.getAllTransfers(params),
        warehouseService.getAllWarehouses(),
        skuService.getAllSKUs()
      ]);
      
      // Handle nested response structures
      let transfersData = transfersRes?.transfers || transfersRes?.data?.transfers || transfersRes?.data || [];
      const warehousesData = warehousesRes?.warehouses || warehousesRes?.data?.warehouses || warehousesRes?.data || [];
      const skusData = skusRes?.skus || skusRes?.data?.skus || skusRes?.data || [];
      
      // Filter transfers by assigned warehouse for non-admin users
      if (currentUser?.role !== 'ADMIN' && currentUser?.assignedWarehouse) {
        transfersData = Array.isArray(transfersData) ? transfersData.filter(transfer => {
          const sourceId = transfer.sourceWarehouse?._id || transfer.sourceWarehouse;
          const destId = transfer.destinationWarehouse?._id || transfer.destinationWarehouse;
          return sourceId === currentUser.assignedWarehouse || destId === currentUser.assignedWarehouse;
        }) : [];
      }
      
      setTransfers(Array.isArray(transfersData) ? transfersData : []);
      setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
      setSKUs(Array.isArray(skusData) ? skusData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchesForSKU = async (itemIndex, skuId) => {
    if (!skuId || !formData.sourceWarehouse) return;
    
    try {
      setLoadingBatches(prev => ({ ...prev, [itemIndex]: true }));
      const response = await batchService.getAllBatches();
      const batchData = response?.data?.batches || response?.batches || [];
      
      // Filter batches by warehouse and SKU
      const filteredBatches = batchData.filter(batch => {
        const batchWarehouseId = batch.warehouse?._id || batch.warehouse;
        
        // Match SKU - handle both SKU code and SKU ID
        let batchSKUId = null;
        if (batch.product?.sku) {
          if (typeof batch.product.sku === 'object' && batch.product.sku._id) {
            batchSKUId = batch.product.sku._id;
          } else if (typeof batch.product.sku === 'string') {
            if (batch.product.sku.length === 24) {
              batchSKUId = batch.product.sku;
            } else {
              // It's a SKU code, find matching SKU
              const matchingSKU = skus.find(s => s.skuCode === batch.product.sku);
              if (matchingSKU) batchSKUId = matchingSKU._id;
            }
          }
        }
        
        const warehouseMatch = String(batchWarehouseId) === String(formData.sourceWarehouse);
        const skuMatch = batchSKUId && String(batchSKUId) === String(skuId);
        const hasQuantity = batch.currentQuantity > 0;
        
        // Remove status check - only verify warehouse match, SKU match, and quantity availability
        // Status field may not always match expected values ('Active' vs 'AVAILABLE')
        return warehouseMatch && skuMatch && hasQuantity;
      });
      
      setAvailableBatches(prev => ({ ...prev, [itemIndex]: filteredBatches }));
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoadingBatches(prev => ({ ...prev, [itemIndex]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate quantities don't exceed available stock
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (item.selectedBatch) {
        const batch = availableBatches[i]?.find(b => b._id === item.selectedBatch);
        if (batch && parseInt(item.quantity) > batch.currentQuantity) {
          alert(`Item ${i + 1}: Cannot transfer ${item.quantity} units. Only ${batch.currentQuantity} units available in batch ${batch.batchNumber}`);
          return;
        }
      }
    }
    
    try {
      await transferService.createTransfer(formData);
      alert('Transfer created successfully!');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert(error.response?.data?.message || 'Failed to create transfer');
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await transferService.approveTransfer(id);
        alert('Transfer approved!');
      } else if (action === 'reject') {
        const reason = prompt('Please provide rejection reason:');
        if (reason) {
          await transferService.rejectTransfer(id, reason);
          alert('Transfer rejected!');
        }
      } else if (action === 'dispatch') {
        if (window.confirm('Confirm that items have been dispatched from the warehouse?')) {
          await transferService.dispatchTransfer(id);
          alert('Transfer dispatched successfully! Items will be received at destination warehouse.');
        }
      }
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        await transferService.deleteTransfer(id);
        alert('Transfer deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting transfer:', error);
        alert(error.response?.data?.message || 'Failed to delete transfer');
      }
    }
  };

  const handleView = async (id) => {
    try {
      const response = await transferService.getTransfer(id);
      setViewTransfer(response.data?.transfer || response.transfer);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching transfer details:', error);
      alert('Failed to load transfer details');
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { sku: '', selectedBatch: null, batchNumber: '', quantity: '', expiryDate: '' }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    setAvailableBatches(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          if (field === 'sku') {
            // Fetch batches when SKU changes
            fetchBatchesForSKU(index, value);
            return { ...item, sku: value, selectedBatch: null, batchNumber: '', quantity: '', expiryDate: '' };
          }
          if (field === 'selectedBatch') {
            // Auto-fill batch details when batch is selected
            const batches = availableBatches[index] || [];
            const selectedBatch = batches.find(b => b._id === value);
            if (selectedBatch) {
              return {
                ...item,
                selectedBatch: value,
                batchNumber: selectedBatch.batchNumber,
                expiryDate: selectedBatch.expiryDate ? selectedBatch.expiryDate.split('T')[0] : '',
                quantity: '' // Reset quantity when batch changes
              };
            }
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const resetForm = () => {
    setFormData({
      sourceWarehouse: '',
      destinationWarehouse: '',
      items: [{ sku: '', selectedBatch: null, batchNumber: '', quantity: '', expiryDate: '' }],
      notes: ''
    });
    setAvailableBatches({});
    setLoadingBatches({});
  };

  const getStatusColor = (status) => {
    const colors = {
      REQUESTED: 'bg-gray-100 text-gray-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      IN_TRANSIT: 'bg-yellow-100 text-yellow-800',
      RECEIVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canApprove = (transfer) => transfer.status === 'REQUESTED' && user?.role === 'ADMIN';
  const canReject = (transfer) => transfer.status === 'REQUESTED' && user?.role === 'ADMIN';
  const canDelete = (transfer) => (transfer.status === 'APPROVED' || transfer.status === 'REJECTED') && user?.role === 'ADMIN';
  
  const canDispatch = (transfer) => {
    if (transfer.status !== 'APPROVED') return false;
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'INVENTORY_MANAGER' || user?.role === 'WAREHOUSE_STAFF') {
      const sourceId = transfer.sourceWarehouse?._id || transfer.sourceWarehouse;
      return String(sourceId) === String(user.assignedWarehouse);
    }
    return false;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Warehouse Transfers</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage inter-warehouse stock transfers</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Create Transfer
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="REQUESTED">Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="RECEIVED">Received</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Transfer Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Transfer #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No transfers found</td>
                  </tr>
                ) : (
                  transfers.map((transfer) => (
                    <tr key={transfer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{transfer.transferNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{transfer.sourceWarehouse?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{transfer.destinationWarehouse?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{transfer.items?.length} items</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button onClick={() => handleView(transfer._id)} className="text-blue-600 hover:text-blue-800">
                          View
                        </button>
                        {canApprove(transfer) && (
                          <button onClick={() => handleAction(transfer._id, 'approve')} className="text-green-600 hover:text-green-800">
                            Approve
                          </button>
                        )}
                        {canReject(transfer) && (
                          <button onClick={() => handleAction(transfer._id, 'reject')} className="text-red-600 hover:text-red-800">
                            Reject
                          </button>
                        )}
                        {canDispatch(transfer) && (
                          <button onClick={() => handleAction(transfer._id, 'dispatch')} className="text-purple-600 hover:text-purple-800 font-medium">
                            Dispatch
                          </button>
                        )}
                        {canDelete(transfer) && (
                          <button onClick={() => handleDelete(transfer._id)} className="text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Create Warehouse Transfer</h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source Warehouse *</label>
                        {user?.role === 'ADMIN' ? (
                          <select
                            value={formData.sourceWarehouse}
                            onChange={(e) => setFormData(prev => ({ ...prev, sourceWarehouse: e.target.value }))}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Select Source Warehouse</option>
                            {warehouses.map(wh => (
                              <option key={wh._id} value={wh._id}>
                                {wh.code} - {wh.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <>
                            <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                              {(() => {
                                const warehouse = warehouses.find(wh => wh._id === formData.sourceWarehouse);
                                return warehouse ? `${warehouse.code} - ${warehouse.name}` : (warehouses.length === 0 ? 'Loading warehouses...' : 'No warehouse assigned');
                              })()}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ℹ️ Auto-selected based on your assigned warehouse
                            </p>
                            <input type="hidden" name="sourceWarehouse" value={formData.sourceWarehouse} required />
                          </>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination Warehouse *</label>
                        <select
                          value={formData.destinationWarehouse}
                          onChange={(e) => setFormData(prev => ({ ...prev, destinationWarehouse: e.target.value }))}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select Destination Warehouse</option>
                          {warehouses.filter(wh => wh._id !== formData.sourceWarehouse).map(wh => (
                            <option key={wh._id} value={wh._id}>
                              {wh.code} - {wh.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Transfer Items *</label>
                      {formData.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-3 bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex gap-3 mb-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Select SKU *</label>
                              <select
                                value={item.sku}
                                onChange={(e) => updateItem(index, 'sku', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="">Choose a SKU</option>
                                {skus.map(sku => (
                                  <option key={sku._id} value={sku._id}>{sku.skuCode} - {sku.name}</option>
                                ))}
                              </select>
                            </div>
                            {formData.items.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeItem(index)} 
                                className="self-end px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            )}
                          </div>
                          
                          {item.sku && formData.sourceWarehouse && (
                            <>
                              {loadingBatches[index] ? (
                                <div className="text-sm text-gray-500 dark:text-gray-400 py-3 text-center">
                                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2"></div>
                                  Loading available batches...
                                </div>
                              ) : availableBatches[index]?.length > 0 ? (
                                <>
                                  <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Select Batch *</label>
                                    <select
                                      value={item.selectedBatch || ''}
                                      onChange={(e) => updateItem(index, 'selectedBatch', e.target.value)}
                                      required
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                      <option value="">Choose a batch</option>
                                      {availableBatches[index].map(batch => (
                                        <option key={batch._id} value={batch._id}>
                                          {batch.batchNumber} | Available: {batch.currentQuantity} units | Expiry: {new Date(batch.expiryDate).toLocaleDateString()}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  
                                  {item.selectedBatch && (
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                      <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Batch Details</h4>
                                      </div>
                                      <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Batch Number</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Available Quantity</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Expiry Date</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr className="border-t border-gray-200 dark:border-gray-600">
                                            <td className="px-3 py-2">
                                              <span className="text-sm font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                                {item.batchNumber}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2">
                                              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                                {availableBatches[index]?.find(b => b._id === item.selectedBatch)?.currentQuantity || 0} units
                                              </span>
                                            </td>
                                            <td className="px-3 py-2">
                                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-US', { 
                                                  year: 'numeric', 
                                                  month: 'short', 
                                                  day: 'numeric' 
                                                }) : 'N/A'}
                                              </span>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <div className="p-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-600">
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                          Transfer Quantity * 
                                          <span className="text-gray-500 dark:text-gray-500 font-normal ml-1">
                                            (Max: {availableBatches[index]?.find(b => b._id === item.selectedBatch)?.currentQuantity || 0})
                                          </span>
                                        </label>
                                        <input
                                          type="number"
                                          value={item.quantity}
                                          onChange={(e) => {
                                            const maxQty = availableBatches[index]?.find(b => b._id === item.selectedBatch)?.currentQuantity || 0;
                                            const value = parseInt(e.target.value) || 0;
                                            if (value > maxQty) {
                                              alert(`Cannot transfer more than ${maxQty} units available in this batch!`);
                                              return;
                                            }
                                            updateItem(index, 'quantity', e.target.value);
                                          }}
                                          onBlur={(e) => {
                                            const maxQty = availableBatches[index]?.find(b => b._id === item.selectedBatch)?.currentQuantity || 0;
                                            const value = parseInt(e.target.value) || 0;
                                            if (value > maxQty) {
                                              updateItem(index, 'quantity', maxQty.toString());
                                            }
                                          }}
                                          placeholder="Enter quantity to transfer"
                                          required
                                          min="1"
                                          max={availableBatches[index]?.find(b => b._id === item.selectedBatch)?.currentQuantity || 999999}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {item.quantity && (
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {parseInt(item.quantity) > 0 && 
                                             parseInt(item.quantity) <= (availableBatches[index]?.find(b => b._id === item.selectedBatch)?.currentQuantity || 0) ? (
                                              <span className="text-green-600 dark:text-green-400">✓ Valid quantity</span>
                                            ) : (
                                              <span className="text-red-600 dark:text-red-400">✗ Exceeds available stock</span>
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg flex items-start gap-2">
                                  <span className="material-symbols-outlined text-base">warning</span>
                                  <span>No available batches for this SKU in the selected warehouse. Please choose a different SKU or check inventory.</span>
                                </div>
                              )}
                            </>
                          )}
                          
                          {item.sku && !formData.sourceWarehouse && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start gap-2">
                              <span className="material-symbols-outlined text-base">info</span>
                              <span>Please select a source warehouse first to view available batches.</span>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-1 text-primary hover:text-blue-700 text-sm font-medium px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Add Another Item
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-700">
                      Create Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); resetForm(); }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Transfer Modal */}
        {showViewModal && viewTransfer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Transfer Details</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{viewTransfer.transferNumber}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(viewTransfer.status)}`}>
                    {viewTransfer.status}
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Warehouse Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Source Warehouse</h3>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {viewTransfer.sourceWarehouse?.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {viewTransfer.sourceWarehouse?.code}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Destination Warehouse</h3>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {viewTransfer.destinationWarehouse?.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {viewTransfer.destinationWarehouse?.code}
                      </p>
                    </div>
                  </div>

                  {/* Transfer Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Items</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SKU</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Batch Number</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expiry Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {viewTransfer.items?.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {item.sku?.skuCode} - {item.sku?.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.batchNumber || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">
                                {item.location ? (
                                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                    {item.location.aisle}-{item.location.rack}-{item.location.bin}
                                  </span>
                                ) : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Requested By</h3>
                      <p className="text-gray-900 dark:text-white">{viewTransfer.requestedBy?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{viewTransfer.requestedBy?.email || ''}</p>
                    </div>
                    {viewTransfer.approvedBy && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Approved By</h3>
                        <p className="text-gray-900 dark:text-white">{viewTransfer.approvedBy?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {viewTransfer.approvalDate ? new Date(viewTransfer.approvalDate).toLocaleString() : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  {viewTransfer.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
                      <p className="text-gray-900 dark:text-white">{viewTransfer.notes}</p>
                    </div>
                  )}

                  {viewTransfer.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">Rejection Reason</h3>
                      <p className="text-red-700 dark:text-red-300">{viewTransfer.rejectionReason}</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Created: {new Date(viewTransfer.createdAt).toLocaleString()}</p>
                    {viewTransfer.updatedAt && viewTransfer.updatedAt !== viewTransfer.createdAt && (
                      <p>Last Updated: {new Date(viewTransfer.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => { setShowViewModal(false); setViewTransfer(null); }}
                    className="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WarehouseTransfers;
