import api from './api';

const adminService = {
  // Get all activity logs
  getActivityLogs: async () => {
    const response = await api.get('/admin/logs');
    return response.data;
  },

  // Update property status or fields (Approve/Reject/Featured)
  updatePropertyStatus: async (id, updateData) => {
    const response = await api.put(`/admin/properties/${id}/status`, updateData);
    return response.data;
  },

  // Get all users
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Update user status
  updateUserStatus: async (id, active) => {
    const response = await api.put(`/admin/users/${id}/status`, { active });
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Create user
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Get all subscription plans
  getSubscriptionPlans: async () => {
    const response = await api.get('/admin/plans');
    return response.data;
  },

  // Create plan
  createSubscriptionPlan: async (planData) => {
    const response = await api.post('/admin/plans', planData);
    return response.data;
  },

  // Update plan
  updateSubscriptionPlan: async (id, planData) => {
    const response = await api.put(`/admin/plans/${id}`, planData);
    return response.data;
  },

  // Delete plan
  deleteSubscriptionPlan: async (id) => {
    const response = await api.delete(`/admin/plans/${id}`);
    return response.data;
  }
};

export default adminService;
