import api from './api';

const reportService = {
  getReorderSuggestions: async (warehouseId = null) => {
    const params = warehouseId ? { warehouseId } : {};
    const response = await api.get('/reorder/suggestions', { params });
    return response.data;
  },

  createDraftPR: async (suggestions, warehouseId) => {
    const response = await api.post('/reorder/create-pr', { suggestions, warehouseId });
    return response.data;
  },

  getABCAnalysis: async () => {
    const response = await api.get('/reorder/reports/abc-analysis');
    return response.data;
  },

  getStockAgeingReport: async (warehouseId = null) => {
    const params = warehouseId ? { warehouseId } : {};
    const response = await api.get('/reorder/reports/stock-ageing', { params });
    return response.data;
  },

  getTurnoverRatio: async (skuId = null, months = 12) => {
    const params = { months };
    if (skuId) params.skuId = skuId;
    const response = await api.get('/reorder/reports/turnover-ratio', { params });
    return response.data;
  },

  getStockValueReport: async (warehouseId = null) => {
    const params = warehouseId ? { warehouseId } : {};
    const response = await api.get('/reorder/reports/stock-value', { params });
    return response.data;
  },

  getSupplierPerformance: async () => {
    const response = await api.get('/reorder/reports/supplier-performance');
    return response.data;
  },

  getOrderFulfillmentReport: async (days = 30) => {
    const params = { days };
    const response = await api.get('/reorder/reports/order-fulfillment', { params });
    return response.data;
  }
};

export default reportService;
