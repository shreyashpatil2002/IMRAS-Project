import api from './api';

const poService = {
  getAllPOs: async (params = {}) => {
    const response = await api.get('/purchase-orders', { params });
    return response.data;
  },

  getPO: async (id) => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  createPO: async (poData) => {
    const response = await api.post('/purchase-orders', poData);
    return response.data;
  },

  updatePO: async (id, poData) => {
    const response = await api.put(`/purchase-orders/${id}`, poData);
    return response.data;
  },

  approvePO: async (id) => {
    const response = await api.post(`/purchase-orders/${id}/approve`);
    return response.data;
  },

  sendPO: async (id) => {
    const response = await api.post(`/purchase-orders/${id}/send`);
    return response.data;
  },

  receivePO: async (id, items) => {
    const response = await api.post(`/purchase-orders/${id}/receive`, { items });
    return response.data;
  },

  cancelPO: async (id, reason) => {
    const response = await api.post(`/purchase-orders/${id}/cancel`, { reason });
    return response.data;
  },

  closePO: async (id) => {
    const response = await api.post(`/purchase-orders/${id}/close`);
    return response.data;
  }
};

export default poService;
