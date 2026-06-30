import api from './api';

const leadService = {
  // Create new lead (enquiry/call)
  createLead: async (leadData) => {
    try {
      const response = await api.post('/leads', leadData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leads for B2B owner or Admin
  getB2BLeads: async () => {
    try {
      const response = await api.get('/leads');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get analytics (leads & clicks)
  getAnalytics: async (timeframe, viewType = 'date') => {
    try {
      const response = await api.get('/leads/analytics', { params: { timeframe, viewType } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update lead status
  updateLeadStatus: async (id, status, notes = '') => {
    try {
      const response = await api.put(`/leads/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default leadService;