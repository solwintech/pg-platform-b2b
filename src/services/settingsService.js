import api from './api';

const settingsService = {
  // Get website settings
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update website settings
  updateSettings: async (settingsData, files = {}) => {
    try {
      const formData = new FormData();

      // Append normal data
      Object.keys(settingsData).forEach(key => {
        if (typeof settingsData[key] === 'object' && settingsData[key] !== null) {
          formData.append(key, JSON.stringify(settingsData[key]));
        } else {
          formData.append(key, settingsData[key]);
        }
      });

      // Append files if they exist
      if (files.siteLogo) formData.append('siteLogo', files.siteLogo);
      if (files.favicon) formData.append('favicon', files.favicon);

      const response = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default settingsService;
