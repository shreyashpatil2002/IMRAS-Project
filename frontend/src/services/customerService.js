import api from './api';

const customerService = {
  // Get all customers
  getAllCustomers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/customers${queryString ? `?${queryString}` : ''}`);
  },

  // Get single customer
  getCustomer: async (id) => {
    return await api.get(`/customers/${id}`);
  },

  // Create new customer
  createCustomer: async (customerData) => {
    return await api.post('/customers', customerData);
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    return await api.put(`/customers/${id}`, customerData);
  },

  // Delete customer
  deleteCustomer: async (id) => {
    return await api.delete(`/customers/${id}`);
  },

  // Get customer statistics
  getCustomerStats: async () => {
    return await api.get('/customers/stats/overview');
  }
};

export default customerService;
