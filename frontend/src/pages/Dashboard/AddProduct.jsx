import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    quantity: '',
    unit: '',
    price: '',
    supplier: '',
    location: '',
    reorderPoint: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Product added:', formData);
    // Handle product addition logic
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <DashboardLayout title="Add New Product">
      <div className="max-w-[900px] mx-auto">
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#0d121b] dark:text-white mb-2">
              Add New Product
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter product details to add it to your inventory
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  required
                  value={formData.productName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="SKU-XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="components">Components</option>
                  <option value="accessories">Accessories</option>
                  <option value="tools">Tools</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supplier *
                </label>
                <select
                  name="supplier"
                  required
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select supplier</option>
                  <option value="supplier1">Acme Corp</option>
                  <option value="supplier2">Tech Supplies Inc</option>
                  <option value="supplier3">Global Parts Ltd</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit *
                </label>
                <select
                  name="unit"
                  required
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select unit</option>
                  <option value="pieces">Pieces</option>
                  <option value="boxes">Boxes</option>
                  <option value="pallets">Pallets</option>
                  <option value="kg">Kilograms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit Price *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reorder Point *
                </label>
                <input
                  type="number"
                  name="reorderPoint"
                  required
                  value={formData.reorderPoint}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Minimum quantity threshold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Warehouse location"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Product description and notes"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 md:flex-none md:px-8 h-11 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg transition-all"
              >
                Add Product
              </button>
              <button
                type="button"
                className="flex-1 md:flex-none md:px-8 h-11 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-[#0d121b] dark:text-white font-bold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;
