import api from './api';

const prService = {
  getAllPRs: async (params = {}) => {
    const response = await api.get('/purchase-requisitions', { params });
    return response.data;
  },

  getPR: async (id) => {
    const response = await api.get(`/purchase-requisitions/${id}`);
    return response.data;
  },

  createPR: async (prData) => {
    const response = await api.post('/purchase-requisitions', prData);
    return response.data;
  },

  updatePR: async (id, prData) => {
    const response = await api.put(`/purchase-requisitions/${id}`, prData);
    return response.data;
  },

  submitPR: async (id) => {
    const response = await api.post(`/purchase-requisitions/${id}/submit`);
    return response.data;
  },

  approvePR: async (id) => {
    const response = await api.post(`/purchase-requisitions/${id}/approve`);
    return response.data;
  },

  rejectPR: async (id, rejectionReason) => {
    const response = await api.post(`/purchase-requisitions/${id}/reject`, { reason: rejectionReason });
    return response.data;
  },

  convertToPO: async (id) => {
    const response = await api.post(`/purchase-requisitions/${id}/convert-to-po`);
    return response.data;
  },

  deletePR: async (id) => {
    const response = await api.delete(`/purchase-requisitions/${id}`);
    return response.data;
  }
};

export default prService;
