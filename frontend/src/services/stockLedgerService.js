import api from './api';

const stockLedgerService = {
  getAllTransactions: async (params = {}) => {
    const response = await api.get('/stock-ledger', { params });
    return response.data;
  },

  getTransaction: async (id) => {
    const response = await api.get(`/stock-ledger/${id}`);
    return response.data;
  },

  getSKUHistory: async (skuId, params = {}) => {
    const response = await api.get(`/stock-ledger/sku/${skuId}`, { params });
    return response.data;
  }
};

export default stockLedgerService;
