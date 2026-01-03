import api from './api';

const transferService = {
  getAllTransfers: async (params = {}) => {
    const response = await api.get('/transfers', { params });
    return response.data;
  },

  getTransfer: async (id) => {
    const response = await api.get(`/transfers/${id}`);
    return response.data;
  },

  createTransfer: async (transferData) => {
    const response = await api.post('/transfers', transferData);
    return response.data;
  },

  approveTransfer: async (id) => {
    const response = await api.post(`/transfers/${id}/approve`);
    return response.data;
  },

  dispatchTransfer: async (id, items) => {
    const response = await api.post(`/transfers/${id}/dispatch`, { items });
    return response.data;
  },

  receiveTransfer: async (id, items) => {
    const response = await api.post(`/transfers/${id}/receive`, { items });
    return response.data;
  },

  rejectTransfer: async (id, rejectionReason) => {
    const response = await api.post(`/transfers/${id}/reject`, { rejectionReason });
    return response.data;
  },

  deleteTransfer: async (id) => {
    const response = await api.delete(`/transfers/${id}`);
    return response.data;
  }
};

export default transferService;
