import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import orderService from '../../services/orderService';
import authService from '../../services/authService';

const Dispatch = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('CONFIRMED');
  const [user, setUser] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { status: statusFilter };
      
      const response = await orderService.getAllOrders(params);
      const ordersData = response.data?.orders || response.orders || [];
      
      // Filter out PENDING orders (not yet approved by admin)
      // Only show CONFIRMED and later statuses in Dispatch
      let filteredOrders = ordersData.filter(order => order.status !== 'PENDING');
      
      // Filter by user's assigned warehouse for non-admin users
      if (user?.role !== 'ADMIN' && user?.assignedWarehouse) {
        filteredOrders = filteredOrders.filter(order => {
          const orderWarehouseId = order.warehouse?._id || order.warehouse;
          return String(orderWarehouseId) === String(user.assignedWarehouse);
        });
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const confirmMessages = {
        'PICKING': 'Start picking this order?',
        'PICKED': 'Mark order as picked and completed?',
        'PACKED': 'Mark order as packed and ready to ship?',
        'SHIPPED': 'Ship this order? Stock will be deducted from inventory.'
      };
      
      const message = confirmMessages[newStatus] || `Update order status to ${newStatus}?`;
      
      if (window.confirm(message)) {
        await orderService.updateOrderStatus(orderId, newStatus);
        alert('Order status updated successfully!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update status';
      alert(errorMessage);
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

  const getActionForStatus = (status) => {
    const actions = {
      CONFIRMED: { label: 'Start Picking', nextStatus: 'PICKING', icon: 'start', color: 'blue' },
      PICKING: { label: 'Complete Picking', nextStatus: 'PICKED', icon: 'check_circle', color: 'indigo' },
      PICKED: { label: 'Mark as Packed', nextStatus: 'PACKED', icon: 'inventory', color: 'cyan' },
      PACKED: { label: 'Ship Order', nextStatus: 'SHIPPED', icon: 'local_shipping', color: 'green' }
    };
    return actions[status];
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Order Dispatch</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Pick, pack, and ship customer orders</p>
        </div>

        {/* Status Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['CONFIRMED', 'PICKING', 'PICKED', 'PACKED', 'SHIPPED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-600 dark:text-gray-300 w-12"></th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Order Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading orders...</p>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No orders found for {statusFilter} status
                    </td>
                  </tr>
                ) : (
                  <>
                  {orders.map((order) => {
                    const action = getActionForStatus(order.status);
                    const isExpanded = expandedOrders.includes(order._id);
                    return (
                      <React.Fragment key={order._id}>
                        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => toggleOrderExpand(order._id)}
                              className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {isExpanded ? 'expand_less' : 'expand_more'}
                              </span>
                            </button>
                          </td>
                          <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-gray-900 dark:text-white">
                            {order.orderNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {order.customer?.name || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {order.customer?.customerCode}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {order.items?.length || 0} item(s)
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          ${order.totalAmount?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {action && (
                            <button
                              onClick={() => handleStatusChange(order._id, action.nextStatus)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-${action.color}-600 hover:bg-${action.color}-700 text-white font-medium transition-all shadow-sm`}
                              style={{
                                backgroundColor: action.color === 'blue' ? '#2563eb' :
                                               action.color === 'indigo' ? '#4f46e5' :
                                               action.color === 'cyan' ? '#06b6d4' :
                                               action.color === 'green' ? '#16a34a' : '#6b7280'
                              }}
                            >
                              <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
                              <span>{action.label}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50 dark:bg-gray-700/30">
                          <td colSpan="8" className="px-6 py-4">
                            <div className="ml-4">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Picking Details</h4>
                              <div className="space-y-2">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {item.sku?.skuCode}
                                          </span>
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.sku?.name}
                                          </span>
                                        </div>
                                        {item.batch && (
                                          <div className="grid grid-cols-3 gap-4 mt-2">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded px-3 py-2">
                                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Batch Number</p>
                                              <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                                                {item.batch?.batchNumber || 'N/A'}
                                              </p>
                                            </div>
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded px-3 py-2">
                                              <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Location</p>
                                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {item.batch?.location || 'N/A'}
                                              </p>
                                            </div>
                                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded px-3 py-2">
                                              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Expiry Date</p>
                                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {item.batch?.expiryDate ? new Date(item.batch.expiryDate).toLocaleDateString() : 'N/A'}
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="ml-4 text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quantity</p>
                                        <p className="text-2xl font-bold text-primary">{item.quantity}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                    );
                  })}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Section */}
        {orders.length > 0 && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.slice(0, 2).map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Order {order.orderNumber}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Customer</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer?.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Shipping Address</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
                      {order.shippingAddress?.state} {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Items to Pick</p>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.sku?.skuCode} - {item.sku?.name}
                            </span>
                            <span className="text-sm font-bold text-primary">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          {item.batch && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Batch:</span>
                                  <span className="ml-1 font-mono font-semibold text-gray-900 dark:text-white">
                                    {item.batch?.batchNumber || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                  <span className="ml-1 font-semibold text-blue-600 dark:text-blue-400">
                                    {item.batch?.location || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              {item.batch?.expiryDate && (
                                <div className="mt-1 text-xs">
                                  <span className="text-gray-500 dark:text-gray-400">Expiry:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">
                                    {new Date(item.batch.expiryDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dispatch;
