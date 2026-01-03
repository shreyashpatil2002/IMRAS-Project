import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import skuService from '../../services/skuService';
import warehouseService from '../../services/warehouseService';
import supplierService from '../../services/supplierService';

const SKUManagement = () => {
  const [skus, setSKUs] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [formData, setFormData] = useState({
    skuCode: '',
    name: '',
    category: 'FMCG',
    customCategory: '',
    uom: 'pcs',
    minStock: '',
    maxStock: '',
    safetyStock: '',
    status: 'ACTIVE',
    leadTime: 7,
    unitCost: '',
    sellingPrice: '',
    supplier: '',
    description: ''
  });

  const categories = ['FMCG', 'Electronics', 'Accessories', 'Grocery', 'Beverages', 'Personal Care', 'Home Care', 'Other'];
  const units = ['pcs', 'kg', 'ltr', 'box', 'pack', 'set', 'dozen', 'gm', 'ml'];
  const statuses = ['ACTIVE', 'INACTIVE', 'DISCONTINUED'];

  useEffect(() => {
    fetchData();
  }, [searchTerm, categoryFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;

      const [skusRes, warehousesRes, suppliersRes] = await Promise.all([
        skuService.getAllSKUs(params),
        warehouseService.getAllWarehouses(),
        supplierService.getAllSuppliers({ status: 'Active' })
      ]);

      console.log('Full warehouse response:', warehousesRes);
      console.log('Warehouses data:', warehousesRes.data);
      console.log('Warehouses array:', warehousesRes.warehouses);
      
      console.log('Full SKU response:', skusRes);
      console.log('SKU data:', skusRes.data);

      setSKUs(skusRes.skus || []);
      setWarehouses(warehousesRes.warehouses || []);
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : suppliersRes.data?.suppliers || []);
      
      console.log('SKUs loaded:', skusRes.skus || []);
      console.log('Warehouses loaded:', warehousesRes.warehouses);
      console.log('Warehouses state set to:', warehousesRes.warehouses || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      // Use custom category if "Other" is selected and customCategory is provided
      if (formData.category === 'Other' && formData.customCategory.trim()) {
        submitData.category = formData.customCategory.trim();
      }
      
      if (editMode && selectedSKU) {
        await skuService.updateSKU(selectedSKU._id, submitData);
        alert('SKU updated successfully!');
      } else {
        await skuService.createSKU(submitData);
        alert('SKU created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving SKU:', error);
      alert(error.response?.data?.message || 'Failed to save SKU');
    }
  };

  const handleEdit = (sku) => {
    setSelectedSKU(sku);
    setFormData({
      skuCode: sku.skuCode,
      name: sku.name,
      category: sku.category,
      uom: sku.uom || sku.unit || 'pcs',
      minStock: sku.minStock,
      maxStock: sku.maxStock,
      safetyStock: sku.safetyStock,
      status: sku.status || 'ACTIVE',
      leadTime: sku.leadTime,
      unitCost: sku.unitCost,
      sellingPrice: sku.sellingPrice,
      supplier: sku.supplier?._id || '',
      description: sku.description || ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this SKU?')) {
      try {
        await skuService.deleteSKU(id);
        alert('SKU deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting SKU:', error);
        alert('Failed to delete SKU');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      skuCode: '',
      name: '',
      category: 'FMCG',
      customCategory: '',
      uom: 'pcs',
      minStock: '',
      maxStock: '',
      safetyStock: '',
      status: 'ACTIVE',
      leadTime: 7,
      unitCost: '',
      sellingPrice: '',
      supplier: '',
      description: ''
    });
    setEditMode(false);
    setSelectedSKU(null);
  };

  const getStatusBadge = (sku) => {
    const status = sku.status || 'ACTIVE';
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      DISCONTINUED: 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || colors.ACTIVE}`}>{status}</span>;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">SKU Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage inventory SKUs and stock levels</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Add New SKU
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by SKU code or name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SKU Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading SKUs...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Min/Max Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {skus.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No SKUs found. Click "Add New SKU" to create one.
                    </td>
                  </tr>
                ) : (
                  skus.map((sku) => (
                    <tr key={sku._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sku.skuCode}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{sku.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{sku.category.replace('_', ' ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{sku.minStock} / {sku.maxStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${sku.unitCost?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{sku.defaultWarehouse?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(sku)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(sku)}
                          className="text-primary hover:text-blue-700 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sku._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  {editMode ? 'Edit SKU' : 'Add New SKU'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SKU Code *</label>
                      <input
                        type="text"
                        name="skuCode"
                        value={formData.skuCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    {formData.category === 'Other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Category *</label>
                        <input
                          type="text"
                          name="customCategory"
                          value={formData.customCategory}
                          onChange={handleInputChange}
                          placeholder="Enter custom category"
                          required={formData.category === 'Other'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit of Measure (UOM) *</label>
                      <select
                        name="uom"
                        value={formData.uom}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Stock *</label>
                      <input
                        type="number"
                        name="minStock"
                        value={formData.minStock}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Stock *</label>
                      <input
                        type="number"
                        name="maxStock"
                        value={formData.maxStock}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Safety Stock *</label>
                      <input
                        type="number"
                        name="safetyStock"
                        value={formData.safetyStock}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status *</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lead Time (days) *</label>
                      <input
                        type="number"
                        name="leadTime"
                        value={formData.leadTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit Cost *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="unitCost"
                        value={formData.unitCost}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selling Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="sellingPrice"
                        value={formData.sellingPrice}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supplier</label>
                      <select
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Supplier</option>
                        {Array.isArray(suppliers) && suppliers.map(sup => (
                          <option key={sup._id} value={sup._id}>{sup.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editMode ? 'Update' : 'Create'} SKU
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); resetForm(); }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SKUManagement;
