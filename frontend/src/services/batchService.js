import api from './api';

const batchService = {
  // Get all batches
  getAllBatches: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/batches${queryString ? `?${queryString}` : ''}`);
  },

  // Get single batch
  getBatch: async (id) => {
    return await api.get(`/batches/${id}`);
  },

  // Create new batch
  createBatch: async (batchData) => {
    return await api.post('/batches', batchData);
  },

  // Update batch
  updateBatch: async (id, batchData) => {
    return await api.put(`/batches/${id}`, batchData);
  },

  // Adjust batch quantity
  adjustBatchQuantity: async (id, adjustmentData) => {
    return await api.patch(`/batches/${id}/adjust`, adjustmentData);
  },

  // Delete batch
  deleteBatch: async (id) => {
    return await api.delete(`/batches/${id}`);
  },

  // Get batch statistics
  getBatchStats: async () => {
    return await api.get('/batches/stats/overview');
  }
};

export default batchService;
