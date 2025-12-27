import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const Suppliers = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [orderData, setOrderData] = useState({
    items: '',
    quantity: '',
    expectedDate: '',
    notes: ''
  });

  const suppliers = [
    { id: 1, name: 'Acme Corp', contact: 'John Smith', email: 'john@acmecorp.com', phone: '+1 234 567 8900', orders: 45, rating: 4.5 },
    { id: 2, name: 'Tech Supplies Inc', contact: 'Sarah Johnson', email: 'sarah@techsupplies.com', phone: '+1 234 567 8901', orders: 32, rating: 4.8 },
    { id: 3, name: 'Global Parts Ltd', contact: 'Mike Davis', email: 'mike@globalparts.com', phone: '+1 234 567 8902', orders: 28, rating: 4.2 },
    { id: 4, name: 'Component World', contact: 'Lisa Brown', email: 'lisa@componentworld.com', phone: '+1 234 567 8903', orders: 19, rating: 4.6 }
  ];

  const handleAddSupplier = (e) => {
    e.preventDefault();
    console.log('New supplier:', formData);
    setShowAddModal(false);
    setFormData({ name: '', contact: '', email: '', phone: '', address: '', notes: '' });
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    console.log('New order for:', selectedSupplier, orderData);
    setShowOrderModal(false);
    setOrderData({ items: '', quantity: '', expectedDate: '', notes: '' });
  };

  const openOrderModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowOrderModal(true);
  };

  return (
    <DashboardLayout title="Suppliers">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#0d121b] dark:text-white mb-1">
                  Suppliers
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your supplier relationships and contacts
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-6 h-11 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Supplier
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-primary/50 transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-[28px]">
                        store
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-1">
                        {supplier.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p><span className="font-medium">Contact:</span> {supplier.contact}</p>
                        <p><span className="font-medium">Email:</span> {supplier.email}</p>
                        <p><span className="font-medium">Phone:</span> {supplier.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{supplier.orders}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{supplier.rating}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-all">
                        View Details
                      </button>
                      <button 
                        onClick={() => openOrderModal(supplier)}
                        className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-all"
                      >
                        Create Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Supplier Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-surface-light dark:bg-surface-dark">
                <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">Add New Supplier</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
              </div>
              <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter contact person name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter supplier address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Additional notes"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg transition-all"
                  >
                    Add Supplier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Order Modal */}
        {showOrderModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-surface-light dark:bg-surface-dark">
                <div>
                  <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">Create Order</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Supplier: {selectedSupplier.name}</p>
                </div>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
              </div>
              <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product/Items *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderData.items}
                    onChange={(e) => setOrderData({...orderData, items: e.target.value})}
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
                      value={orderData.quantity}
                      onChange={(e) => setOrderData({...orderData, quantity: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Delivery *
                    </label>
                    <input
                      type="date"
                      required
                      value={orderData.expectedDate}
                      onChange={(e) => setOrderData({...orderData, expectedDate: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Notes
                  </label>
                  <textarea
                    rows="4"
                    value={orderData.notes}
                    onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Additional order details"
                  />
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

export default Suppliers;
