import api from './api';

const userService = {
  // Get all users
  getAllUsers: async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get editors list
  getEditors: async () => {
    const response = await api.get('/users/editors');
    return response.data;
  },

  // Get writers list
  getWriters: async () => {
    const response = await api.get('/users/writers');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

export default userService;