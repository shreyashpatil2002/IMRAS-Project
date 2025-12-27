import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const Orders = () => {
  const [filter, setFilter] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    supplier: '',
    product: '',
    quantity: '',
    unitPrice: '',
    expectedDate: '',
    priority: 'normal',
    notes: ''
  });

  const orders = [
    { id: 'ORD-001', date: '2025-12-10', supplier: 'Acme Corp', items: 5, total: '$2,450', status: 'Delivered' },
    { id: 'ORD-002', date: '2025-12-11', supplier: 'Tech Supplies', items: 3, total: '$1,890', status: 'In Transit' },
    { id: 'ORD-003', date: '2025-12-12', supplier: 'Global Parts', items: 8, total: '$4,200', status: 'Pending' },
    { id: 'ORD-004', date: '2025-12-12', supplier: 'Acme Corp', items: 2, total: '$850', status: 'Processing' },
    { id: 'ORD-005', date: '2025-12-13', supplier: 'Tech Supplies', items: 6, total: '$3,150', status: 'Delivered' }
  ];

  const handleNewOrder = (e) => {
    e.preventDefault();
    console.log('New order:', orderFormData);
    setShowOrderModal(false);
    setOrderFormData({
      supplier: '',
      product: '',
      quantity: '',
      unitPrice: '',
      expectedDate: '',
      priority: 'normal',
      notes: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'In Transit': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Processing': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Pending': return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <DashboardLayout title="Orders">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#0d121b] dark:text-white mb-1">
                  Purchase Orders
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track and manage all your purchase orders
                </p>
              </div>
              <button 
                onClick={() => setShowOrderModal(true)}
                className="flex items-center justify-center gap-2 px-6 h-11 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                New Order
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-6 overflow-x-auto">
              {['all', 'Pending', 'Processing', 'In Transit', 'Delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total
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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#0d121b] dark:text-white">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {order.date}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {order.supplier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {order.items} items
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#0d121b] dark:text-white">
                        {order.total}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-primary hover:text-primary-dark text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing 1-5 of 5 orders
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>

        {/* New Order Modal */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-surface-light dark:bg-surface-dark">
                <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">Create New Order</h3>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
              </div>
              <form onSubmit={handleNewOrder} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Supplier *
                  </label>
                  <select
                    required
                    value={orderFormData.supplier}
                    onChange={(e) => setOrderFormData({...orderFormData, supplier: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select supplier</option>
                    <option value="acme">Acme Corp</option>
                    <option value="tech">Tech Supplies Inc</option>
                    <option value="global">Global Parts Ltd</option>
                    <option value="component">Component World</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product/Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderFormData.product}
                    onChange={(e) => setOrderFormData({...orderFormData, product: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter product name or SKU"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={orderFormData.quantity}
                      onChange={(e) => setOrderFormData({...orderFormData, quantity: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={orderFormData.unitPrice}
                      onChange={(e) => setOrderFormData({...orderFormData, unitPrice: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Delivery *
                    </label>
                    <input
                      type="date"
                      required
                      value={orderFormData.expectedDate}
                      onChange={(e) => setOrderFormData({...orderFormData, expectedDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={orderFormData.priority}
                      onChange={(e) => setOrderFormData({...orderFormData, priority: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Notes
                  </label>
                  <textarea
                    rows="4"
                    value={orderFormData.notes}
                    onChange={(e) => setOrderFormData({...orderFormData, notes: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Additional details or special instructions"
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="text-xl font-bold text-primary">
                      ${orderFormData.quantity && orderFormData.unitPrice ? (parseFloat(orderFormData.quantity) * parseFloat(orderFormData.unitPrice)).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg transition-all"
                  >
                    Create Order
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

export default Orders;
