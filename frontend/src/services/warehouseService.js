import api from './api';

const warehouseService = {
  getAllWarehouses: async (params = {}) => {
    const response = await api.get('/warehouses', { params });
    return response.data;
  },

  getWarehouse: async (id) => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },

  createWarehouse: async (warehouseData) => {
    const response = await api.post('/warehouses', warehouseData);
    return response.data;
  },

  updateWarehouse: async (id, warehouseData) => {
    const response = await api.put(`/warehouses/${id}`, warehouseData);
    return response.data;
  },

  deleteWarehouse: async (id) => {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  },

  addLocation: async (id, locationData) => {
    const response = await api.post(`/warehouses/${id}/locations`, locationData);
    return response.data;
  },

  updateLocation: async (id, locationId, locationData) => {
    const response = await api.put(`/warehouses/${id}/locations/${locationId}`, locationData);
    return response.data;
  }
};

export default warehouseService;
