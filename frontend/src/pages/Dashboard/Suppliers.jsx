import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import supplierService from '../../services/supplierService';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: { name: '', position: '', phone: '', email: '' },
    email: '',
    phone: '',
    address: '',
    notes: '',
    status: 'Active'
  });
  const [orderData, setOrderData] = useState({
    items: '',
    quantity: '',
    expectedDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getAllSuppliers();
      setSuppliers(Array.isArray(response.data) ? response.data : response.data?.suppliers || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      await supplierService.createSupplier(formData);
      setShowAddModal(false);
      setFormData({ name: '', contact: { name: '', position: '', phone: '', email: '' }, email: '', phone: '', address: '', notes: '', status: 'Active' });
      fetchSuppliers();
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert(error.response?.data?.message || 'Failed to add supplier');
    }
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    try {
      await supplierService.updateSupplier(selectedSupplier._id, formData);
      setShowEditModal(false);
      setShowDetailsModal(false);
      setSelectedSupplier(null);
      setFormData({ name: '', contact: { name: '', position: '', phone: '', email: '' }, email: '', phone: '', address: '', notes: '', status: 'Active' });
      fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert(error.response?.data?.message || 'Failed to update supplier');
    }
  };

  const openDetailsModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const openEditModal = () => {
    setFormData({
      name: selectedSupplier.name,
      contact: {
        name: selectedSupplier.contact?.name || '',
        position: selectedSupplier.contact?.position || '',
        phone: selectedSupplier.contact?.phone || '',
        email: selectedSupplier.contact?.email || ''
      },
      email: selectedSupplier.email,
      phone: selectedSupplier.phone || '',
      address: selectedSupplier.address || '',
      notes: selectedSupplier.notes || '',
      status: selectedSupplier.status
    });
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
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
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading suppliers...</p>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-gray-400 text-3xl">store</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No suppliers found. Add your first supplier to get started.</p>
              </div>
            ) : (
              suppliers.map((supplier) => (
              <div key={supplier._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-primary/50 transition-all">
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
                        <p><span className="font-medium">Contact:</span> {supplier.contact?.name || 'N/A'}</p>
                        <p><span className="font-medium">Email:</span> {supplier.email}</p>
                        <p><span className="font-medium">Phone:</span> {supplier.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        supplier.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {supplier.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openDetailsModal(supplier)}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-all"
                      >
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
            ))
            )}
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
                    value={formData.contact.name}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, name: e.target.value}})}
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

        {/* View Details Modal */}
        {showDetailsModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-surface-light dark:bg-surface-dark">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">store</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">Supplier Details</h3>
                </div>
                <button 
                  onClick={() => { setShowDetailsModal(false); setSelectedSupplier(null); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Supplier Name</label>
                    <p className="text-base font-semibold text-[#0d121b] dark:text-white">{selectedSupplier.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedSupplier.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {selectedSupplier.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Person</label>
                    <p className="text-base text-[#0d121b] dark:text-white">{selectedSupplier.contact?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                    <p className="text-base text-[#0d121b] dark:text-white">{selectedSupplier.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                    <p className="text-base text-[#0d121b] dark:text-white">{selectedSupplier.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created Date</label>
                    <p className="text-base text-[#0d121b] dark:text-white">
                      {selectedSupplier.createdAt ? new Date(selectedSupplier.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                {selectedSupplier.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</label>
                    <p className="text-base text-[#0d121b] dark:text-white">{selectedSupplier.address}</p>
                  </div>
                )}
                {selectedSupplier.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</label>
                    <p className="text-base text-[#0d121b] dark:text-white">{selectedSupplier.notes}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => { setShowDetailsModal(false); setSelectedSupplier(null); }}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="flex-1 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    Edit Supplier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Supplier Modal */}
        {showEditModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-surface-light dark:bg-surface-dark">
                <h3 className="text-xl font-bold text-[#0d121b] dark:text-white">Edit Supplier</h3>
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedSupplier(null); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
              </div>
              <form onSubmit={handleUpdateSupplier} className="p-6 space-y-4">
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
                    value={formData.contact.name}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, name: e.target.value}})}
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
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                    onClick={() => { setShowEditModal(false); setSelectedSupplier(null); }}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg transition-all"
                  >
                    Update Supplier
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
