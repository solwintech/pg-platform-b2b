import api from './api';

class AdService {
  async getAds() {
    try {
      const response = await api.get('/advertisements');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAdsByLocation(location) {
    try {
      const response = await api.get(`/advertisements/location/${location}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createAd(adData) {
    try {
      const response = await api.post('/advertisements', adData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateAd(id, adData) {
    try {
      const response = await api.put(`/advertisements/${id}`, adData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteAd(id) {
    try {
      const response = await api.delete(`/advertisements/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async recordClick(id) {
    try {
      const response = await api.put(`/advertisements/${id}/click`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AdService();
