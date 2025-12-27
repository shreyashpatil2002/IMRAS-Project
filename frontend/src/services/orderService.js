import api from './api';

const orderService = {
  // Get all orders
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/orders${queryString ? `?${queryString}` : ''}`);
  },

  // Get single order
  getOrder: async (id) => {
    return await api.get(`/orders/${id}`);
  },

  // Create new order
  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  // Update order
  updateOrder: async (id, orderData) => {
    return await api.put(`/orders/${id}`, orderData);
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    return await api.patch(`/orders/${id}/status`, { status });
  },

  // Delete order
  deleteOrder: async (id) => {
    return await api.delete(`/orders/${id}`);
  },

  // Get order statistics
  getOrderStats: async () => {
    return await api.get('/orders/stats/overview');
  }
};

export default orderService;
