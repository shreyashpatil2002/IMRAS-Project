import api from './api';

const productService = {
  // Get all products
  getAllProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/products${queryString ? `?${queryString}` : ''}`);
  },

  // Get single product
  getProduct: async (id) => {
    return await api.get(`/products/${id}`);
  },

  // Create new product
  createProduct: async (productData) => {
    return await api.post('/products', productData);
  },

  // Update product
  updateProduct: async (id, productData) => {
    return await api.put(`/products/${id}`, productData);
  },

  // Delete product
  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`);
  },

  // Get product statistics
  getProductStats: async () => {
    return await api.get('/products/stats/overview');
  }
};

export default productService;
