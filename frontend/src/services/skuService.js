import api from './api';

const skuService = {
  getAllSKUs: async (params = {}) => {
    const response = await api.get('/skus', { params });
    return response.data;
  },

  getSKU: async (id) => {
    const response = await api.get(`/skus/${id}`);
    return response.data;
  },

  createSKU: async (skuData) => {
    const response = await api.post('/skus', skuData);
    return response.data;
  },

  updateSKU: async (id, skuData) => {
    const response = await api.put(`/skus/${id}`, skuData);
    return response.data;
  },

  deleteSKU: async (id) => {
    const response = await api.delete(`/skus/${id}`);
    return response.data;
  },

  getSKUStock: async (id, warehouseId = null) => {
    const params = warehouseId ? { warehouseId } : {};
    const response = await api.get(`/skus/${id}/stock`, { params });
    return response.data;
  },

  getSKUStockHistory: async (id, warehouseId = null, limit = 50) => {
    const params = { limit };
    if (warehouseId) params.warehouseId = warehouseId;
    const response = await api.get(`/skus/${id}/history`, { params });
    return response.data;
  }
};

export default skuService;
