import api from './api';

const activityService = {
  getMyActivity: async (params = {}) => {
    const response = await api.get('/stock-ledger/my-activity', { params });
    return response.data;
  }
};

export default activityService;
