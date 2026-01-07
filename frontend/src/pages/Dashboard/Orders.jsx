import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';
import skuService from '../../services/skuService';
import warehouseService from '../../services/warehouseService';
import batchService from '../../services/batchService';
import authService from '../../services/authService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [skus, setSKUs] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPickModal, setShowPickModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [user, setUser] = useState(null);
  const [batchesBySKU, setBatchesBySKU] = useState({});
  const [loadingBatches, setLoadingBatches] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  
  const [formData, setFormData] = useState({
    customer: '',
    warehouse: '',
    items: [{ sku: '', selectedBatch: null, batchNumber: '', quantity: '', unitPrice: '', expiryDate: '' }],
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    shippingMethod: '',
    notes: ''
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const [ordersRes, customersRes, skusRes, warehousesRes] = await Promise.all([
        orderService.getAllOrders(params),
        customerService.getAllCustomers(),
        skuService.getAllSKUs(),
        warehouseService.getAllWarehouses()
      ]);
      
      setOrders(ordersRes.data?.orders || ordersRes.orders || []);
      setCustomers(customersRes.data?.customers || customersRes.customers || []);
      setSKUs(skusRes.skus || skusRes.data?.skus || []);
      setWarehouses(warehousesRes.warehouses || warehousesRes.data?.warehouses || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    try {
      setSubmitting(true);
      const orderData = {
        customer: formData.customer,
        warehouse: formData.warehouse,
        items: formData.items.map(item => ({
          sku: item.sku,
          batch: item.selectedBatch,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice)
        })),
        shippingAddress: formData.shippingAddress,
        shippingMethod: formData.shippingMethod,
        notes: formData.notes
      };
      
      await orderService.createOrder(orderData);
      alert('Sales Order created successfully!');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (actionLoading) return;
    
    try {
      // Handle View action for admin
      if (newStatus === 'VIEW') {
        const order = orders.find(o => o._id === orderId);
        setSelectedOrder(order);
        setShowViewModal(true);
        return;
      }
      
      if (newStatus === 'PICKING') {
        setActionLoading(true);
        setLoadingOrderId(orderId);
        setLoadingAction('PICKING');
        const response = await orderService.getAvailableBatches(orderId);
        setAvailableBatches(response.data?.availableBatches || []);
        const order = orders.find(o => o._id === orderId);
        setSelectedOrder(order);
        setShowPickModal(true);
        setActionLoading(false);
        setLoadingOrderId(null);
        setLoadingAction(null);
        return;
      }
      
      const confirmMessage = newStatus === 'CONFIRMED' 
        ? 'Approve this order? It will be sent to warehouse for processing.'
        : `Update order status to ${newStatus}?`;
      
      if (window.confirm(confirmMessage)) {
        setActionLoading(true);
        setLoadingOrderId(orderId);
        setLoadingAction(newStatus);
        await orderService.updateOrderStatus(orderId, newStatus);
        const successMessage = newStatus === 'CONFIRMED'
          ? 'Order approved successfully! Warehouse staff can now process it.'
          : 'Order status updated successfully!';
        alert(successMessage);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
      setLoadingOrderId(null);
      setLoadingAction(null);
    }
  };

  const handlePickOrder = async () => {
    try {
      const pickedItems = selectedOrder.items.map((item, index) => {
        const batchData = availableBatches[index];
        const selectedBatch = batchData?.batches[0];
        
        return {
          batch: selectedBatch?._id,
          pickedQuantity: item.quantity
        };
      });

      await orderService.updateOrderStatus(selectedOrder._id, 'PICKED', { items: pickedItems });
      alert('Order picked successfully!');
      setShowPickModal(false);
      setSelectedOrder(null);
      fetchData();
    } catch (error) {
      console.error('Error picking order:', error);
      alert(error.response?.data?.message || 'Failed to pick order');
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { sku: '', selectedBatch: null, batchNumber: '', quantity: '', unitPrice: '', expiryDate: '' }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    // Clean up batch data for removed item
    setBatchesBySKU(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
    
    // Fetch batches when SKU changes
    if (field === 'sku' && formData.warehouse) {
      setTimeout(() => fetchBatchesForSKU(index, value), 100);
    }
    
    // Update batch details when batch is selected
    if (field === 'selectedBatch' && value) {
      const selectedBatch = batchesBySKU[index]?.find(b => b._id === value);
      if (selectedBatch) {
        setFormData(prev => ({
          ...prev,
          items: prev.items.map((item, i) => 
            i === index ? {
              ...item,
              batchNumber: selectedBatch.batchNumber,
              expiryDate: selectedBatch.expiryDate
            } : item
          )
        }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customer: '',
      warehouse: user?.role !== 'ADMIN' && user?.assignedWarehouse ? user.assignedWarehouse : '',
      items: [{ sku: '', selectedBatch: null, batchNumber: '', quantity: '', unitPrice: '', expiryDate: '' }],
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      shippingMethod: '',
      notes: ''
    });
    setBatchesBySKU({});
    setLoadingBatches({});
  };

  const fetchBatchesForSKU = async (itemIndex, skuId) => {
    if (!skuId || !formData.warehouse) return;
    
    try {
      setLoadingBatches(prev => ({ ...prev, [itemIndex]: true }));
      const response = await batchService.getAllBatches();
      const batchData = response?.data?.batches || response?.batches || [];
      
      // Get the selected SKU details
      const selectedSKU = skus.find(s => s._id === skuId);
      if (!selectedSKU) {
        setBatchesBySKU(prev => ({ ...prev, [itemIndex]: [] }));
        return;
      }
      
      // Filter batches: Match by warehouse AND product.sku === SKU.skuCode
      const filteredBatches = batchData.filter(batch => {
        // Check warehouse match
        const batchWarehouseId = batch.warehouse?._id || batch.warehouse;
        const warehouseMatch = String(batchWarehouseId) === String(formData.warehouse);
        
        // Check SKU match - the batch's product.sku field should match our SKU's skuCode
        const productSKUCode = batch.product?.sku;
        const skuMatch = productSKUCode && String(productSKUCode).toUpperCase() === String(selectedSKU.skuCode).toUpperCase();
        
        // Check quantity
        const hasQuantity = batch.currentQuantity > 0;
        
        // Only filter by warehouse, SKU match, and quantity
        return warehouseMatch && skuMatch && hasQuantity;
      });
      
      // Sort by expiry date (FEFO)
      filteredBatches.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      
      setBatchesBySKU(prev => ({ ...prev, [itemIndex]: filteredBatches }));
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatchesBySKU(prev => ({ ...prev, [itemIndex]: [] }));
    } finally {
      setLoadingBatches(prev => ({ ...prev, [itemIndex]: false }));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PICKING: 'bg-purple-100 text-purple-800',
      PICKED: 'bg-indigo-100 text-indigo-800',
      PACKED: 'bg-cyan-100 text-cyan-800',
      SHIPPED: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextAction = (order) => {
    // Admin only sees Approve button for PENDING orders
    // Warehouse operations (Pick, Pack, Ship) are handled by managers/staff
    if (user?.role === 'ADMIN') {
      if (order.status === 'PENDING') {
        return { label: 'Approve', status: 'CONFIRMED', color: 'blue' };
      }
      return null; // Admin doesn't see Pick, Pack, Ship buttons
    }
    
    // Warehouse managers and staff see operational buttons
    switch (order.status) {
      case 'PENDING':
        return null; // Only admin can approve
      case 'CONFIRMED':
        return { label: 'Start Picking', status: 'PICKING', color: 'purple' };
      case 'PICKING':
        return { label: 'Complete Pick', status: 'PICKING', color: 'indigo' };
      case 'PICKED':
        return { label: 'Pack', status: 'PACKED', color: 'cyan' };
      case 'PACKED':
        return { label: 'Ship', status: 'SHIPPED', color: 'green' };
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sales Orders</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer orders and fulfillment</p>
          </div>
          <button
            onClick={() => {
              // Auto-select warehouse for non-admin users
              if (user?.role !== 'ADMIN' && user?.assignedWarehouse) {
                setFormData(prev => ({ ...prev, warehouse: user.assignedWarehouse }));
              }
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Create Order
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PICKING">Picking</option>
            <option value="PICKED">Picked</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">No orders found</td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const nextAction = getNextAction(order);
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.customer?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.warehouse?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.items?.length} items</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${order.totalAmount?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            {/* View button - visible to all users at all statuses */}
                            <button
                              onClick={() => handleStatusChange(order._id, 'VIEW')}
                              disabled={actionLoading}
                              className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              View
                            </button>
                            
                            {/* Action button - based on status and role */}
                            {nextAction && nextAction.status !== 'VIEW' && (
                              <button
                                onClick={() => handleStatusChange(order._id, nextAction.status)}
                                disabled={actionLoading}
                                className={`text-${nextAction.color}-600 hover:text-${nextAction.color}-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1`}
                              >
                                {loadingOrderId === order._id && loadingAction === nextAction.status && (
                                  <div className={`w-3 h-3 border-2 border-${nextAction.color}-600 border-t-transparent rounded-full animate-spin`}></div>
                                )}
                                {nextAction.label}
                              </button>
                            )}
                            
                            {/* Cancel button */}
                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'SHIPPED' && (
                              <button
                                onClick={() => handleStatusChange(order._id, 'CANCELLED')}
                                disabled={actionLoading}
                                className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                              >
                                {loadingOrderId === order._id && loadingAction === 'CANCELLED' && (
                                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                )}
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Order Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create Sales Order</h2>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Customer & Warehouse */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer *</label>
                      <select
                        value={formData.customer}
                        onChange={(e) => {
                          const selectedCustomer = customers.find(c => c._id === e.target.value);
                          setFormData(prev => ({ 
                            ...prev, 
                            customer: e.target.value,
                            shippingAddress: selectedCustomer?.address ? {
                              street: selectedCustomer.address.street || '',
                              city: selectedCustomer.address.city || '',
                              state: selectedCustomer.address.state || '',
                              zipCode: selectedCustomer.address.zipCode || '',
                              country: selectedCustomer.address.country || ''
                            } : {
                              street: '',
                              city: '',
                              state: '',
                              zipCode: '',
                              country: ''
                            }
                          }));
                        }}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Customer</option>
                        {customers.map(customer => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name} - {customer.customerCode}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Warehouse *</label>
                      {user?.role === 'ADMIN' ? (
                        <select
                          value={formData.warehouse}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, warehouse: e.target.value }));
                            // Refresh batches for all items when warehouse changes
                            formData.items.forEach((item, index) => {
                              if (item.sku) {
                                setTimeout(() => fetchBatchesForSKU(index, item.sku), 100);
                              }
                            });
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select Warehouse</option>
                          {warehouses.map(wh => (
                            <option key={wh._id} value={wh._id}>{wh.code} - {wh.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                          {warehouses.find(wh => wh._id === formData.warehouse)?.code} - {warehouses.find(wh => wh._id === formData.warehouse)?.name || 'Loading...'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Items *</label>
                      <button
                        type="button"
                        onClick={addItem}
                        className="text-sm text-primary hover:text-blue-700 font-medium"
                      >
                        + Add Item
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Item #{index + 1}</h4>
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            )}
                          </div>

                          {/* SKU Selection */}
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">SKU *</label>
                            <select
                              value={item.sku}
                              onChange={(e) => {
                                // Check if SKU is already selected in another item
                                const skuAlreadySelected = formData.items.some((otherItem, otherIndex) => 
                                  otherIndex !== index && otherItem.sku === e.target.value
                                );
                                
                                if (skuAlreadySelected) {
                                  alert('This SKU is already selected in another item. Please choose a different SKU.');
                                  return;
                                }
                                
                                updateItem(index, 'sku', e.target.value);
                                const selectedSKU = skus.find(s => s._id === e.target.value);
                                if (selectedSKU) {
                                  updateItem(index, 'unitPrice', selectedSKU.sellingPrice);
                                }
                              }}
                              required
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            >
                              <option value="">Select SKU</option>
                              {skus.map(sku => {
                                // Check if this SKU is already selected in another item
                                const isAlreadySelected = formData.items.some((otherItem, otherIndex) => 
                                  otherIndex !== index && otherItem.sku === sku._id
                                );
                                
                                return (
                                  <option 
                                    key={sku._id} 
                                    value={sku._id}
                                    disabled={isAlreadySelected}
                                    style={isAlreadySelected ? { color: '#999', fontStyle: 'italic' } : {}}
                                  >
                                    {sku.skuCode} - {sku.name} {isAlreadySelected ? '(Already selected)' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {/* Loading State */}
                          {loadingBatches[index] && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-2">
                              <span className="material-symbols-outlined animate-spin text-base">refresh</span>
                              <span>Loading batches...</span>
                            </div>
                          )}

                          {/* Batch Selection & Details */}
                          {item.sku && formData.warehouse && !loadingBatches[index] && (
                            <>
                              {batchesBySKU[index] && batchesBySKU[index].length > 0 ? (
                                <>
                                  <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      Select Batch * <span className="text-blue-600 dark:text-blue-400">(FEFO - Sorted by Expiry)</span>
                                    </label>
                                    <select
                                      value={item.selectedBatch || ''}
                                      onChange={(e) => updateItem(index, 'selectedBatch', e.target.value)}
                                      required
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    >
                                      <option value="">Choose Batch</option>
                                      {batchesBySKU[index].map((batch, bIndex) => (
                                        <option key={batch._id} value={batch._id}>
                                          {batch.batchNumber} - Available: {batch.currentQuantity} units - Exp: {new Date(batch.expiryDate).toLocaleDateString()}
                                          {bIndex === 0 ? ' [SUGGESTED]' : ''}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Batch Details Table */}
                                  {item.selectedBatch && (
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden mb-3">
                                      <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-2 border-b border-blue-200 dark:border-blue-700">
                                        <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200">📦 Selected Batch Details</h4>
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
                                                {batchesBySKU[index]?.find(b => b._id === item.selectedBatch)?.currentQuantity || 0} units
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
                                    </div>
                                  )}

                                  {/* Quantity and Price */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Quantity *
                                        {item.selectedBatch && (
                                          <span className="text-gray-500 dark:text-gray-500 font-normal ml-1">
                                            (Max: {batchesBySKU[index]?.find(b => b._id === item.selectedBatch)?.currentQuantity || 0})
                                          </span>
                                        )}
                                      </label>
                                      <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => {
                                          const maxQty = batchesBySKU[index]?.find(b => b._id === item.selectedBatch)?.currentQuantity || 999999;
                                          const value = parseInt(e.target.value) || 0;
                                          if (value > maxQty) {
                                            alert(`Cannot order more than ${maxQty} units available in this batch!`);
                                            return;
                                          }
                                          updateItem(index, 'quantity', e.target.value);
                                        }}
                                        required
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                      />
                                      {item.quantity && item.selectedBatch && (
                                        <p className="text-xs mt-1">
                                          {parseInt(item.quantity) > 0 && 
                                           parseInt(item.quantity) <= (batchesBySKU[index]?.find(b => b._id === item.selectedBatch)?.currentQuantity || 0) ? (
                                            <span className="text-green-600 dark:text-green-400">✓ Valid quantity</span>
                                          ) : (
                                            <span className="text-red-600 dark:text-red-400">✗ Exceeds available stock</span>
                                          )}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Unit Price *</label>
                                      <input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                      />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg flex items-start gap-2">
                                  <span className="material-symbols-outlined text-base">warning</span>
                                  <span>No available batches for this SKU in the selected warehouse.</span>
                                </div>
                              )}
                            </>
                          )}

                          {item.sku && !formData.warehouse && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start gap-2">
                              <span className="material-symbols-outlined text-base">info</span>
                              <span>Please select a warehouse first to view available batches.</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Address</label>
                    <input
                      type="text"
                      placeholder="Street"
                      value={formData.shippingAddress.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: { ...prev.shippingAddress, street: e.target.value } }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.shippingAddress.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: { ...prev.shippingAddress, city: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.shippingAddress.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: { ...prev.shippingAddress, state: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={formData.shippingAddress.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: { ...prev.shippingAddress, zipCode: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={formData.shippingAddress.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: { ...prev.shippingAddress, country: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Shipping Method & Notes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Method</label>
                      <input
                        type="text"
                        value={formData.shippingMethod}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g. Express, Standard"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                      <input
                        type="text"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >                    {submitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}                    {submitting ? 'Creating...' : 'Create Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pick Order Modal */}
        {showPickModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pick Order: {selectedOrder.orderNumber}</h2>
                  <button onClick={() => setShowPickModal(false)} className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    📦 <strong>FEFO Picking:</strong> Batches are sorted by expiry date. Pick from the suggested batches to ensure First Expire First Out.
                  </p>
                </div>

                <div className="space-y-4">
                  {availableBatches.map((item, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.sku?.skuCode} - {item.sku?.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Required: {item.requiredQuantity} {item.sku?.unit}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {item.batches?.map((batch, bIndex) => (
                          <div key={bIndex} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <div className="flex-1">
                              <span className="font-mono text-sm font-medium">{batch.batchNumber}</span>
                              <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                                Available: {batch.currentQuantity} | Expiry: {new Date(batch.expiryDate).toLocaleDateString()}
                              </span>
                              {batch.location && (
                                <span className="ml-3 text-sm text-blue-600 dark:text-blue-400">
                                  📍 {typeof batch.location === 'object' ? `${batch.location.aisle}-${batch.location.bin}` : batch.location}
                                </span>
                              )}
                            </div>
                            {bIndex === 0 && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                SUGGESTED
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPickModal(false)}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePickOrder}
                    className="flex-1 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg transition-all"
                  >
                    Confirm Picking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Order Modal (Admin) */}
        {showViewModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Order Details: {selectedOrder.orderNumber}</h2>
                  <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Order Status</p>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Customer</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.customer?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.customer?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Warehouse</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.warehouse?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.warehouse?.code}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Created By</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.createdBy?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.createdBy?.email || ''}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Order Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedOrder.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedOrder.shippingAddress?.street}<br />
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}<br />
                        {selectedOrder.shippingAddress?.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">${selectedOrder.totalAmount?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {item.sku?.skuCode} - {item.sku?.name}
                            </p>
                            {item.batch && (
                              <div className="mt-2 grid grid-cols-3 gap-3">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Batch Number</p>
                                  <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                    {item.batch?.batchNumber || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {item.batch?.location || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Expiry Date</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {item.batch?.expiryDate ? new Date(item.batch.expiryDate).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                            <p className="text-xl font-bold text-primary">{item.quantity}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">${item.unitPrice} each</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              Total: ${(item.quantity * item.unitPrice).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-all"
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

export default Orders;
