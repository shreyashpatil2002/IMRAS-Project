import api from './api';

const supplierService = {
  // Get all suppliers
  getAllSuppliers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/suppliers${queryString ? `?${queryString}` : ''}`);
  },

  // Get single supplier
  getSupplier: async (id) => {
    return await api.get(`/suppliers/${id}`);
  },

  // Create new supplier
  createSupplier: async (supplierData) => {
    return await api.post('/suppliers', supplierData);
  },

  // Update supplier
  updateSupplier: async (id, supplierData) => {
    return await api.put(`/suppliers/${id}`, supplierData);
  },

  // Delete supplier
  deleteSupplier: async (id) => {
    return await api.delete(`/suppliers/${id}`);
  }
};

export default supplierService;
