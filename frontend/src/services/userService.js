import api from './api';

const userService = {
  // Get all users
  getAllUsers: async () => {
    return await api.get('/users');
  },

  // Get single user
  getUser: async (id) => {
    return await api.get(`/users/${id}`);
  },

  // Create new user
  createUser: async (userData) => {
    return await api.post('/users', userData);
  },

  // Update user
  updateUser: async (id, userData) => {
    return await api.put(`/users/${id}`, userData);
  },

  // Delete user
  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`);
  }
};

export default userService;
