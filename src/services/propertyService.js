import api from './api';
import { dummyProperties } from './dummyData';

const propertyService = {
  // Get all properties (filtered by owner in backend if B2B)
  getProperties: async (params = {}, includeDummy = true) => {
    try {
      const response = await api.get('/properties', { params });
      // If backend returns data, merge with dummy data or return backend data
      const backendProperties = response.data.properties || response.data.data || [];
      return { 
        success: true, 
        properties: includeDummy ? [...backendProperties, ...dummyProperties] : backendProperties,
        backendCount: backendProperties.length
      };
    } catch (error) {
      console.warn('Backend properties fetch failed');
      return { 
        success: true, 
        properties: includeDummy ? dummyProperties : [],
        total: includeDummy ? dummyProperties.length : 0,
        pages: includeDummy ? Math.ceil(dummyProperties.length / 10) : 0,
        backendCount: 0
      };
    }
  },

  // Get single property by ID
  getPropertyById: async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      // Check if it's a dummy property
      const dummyProperty = dummyProperties.find(p => p._id === id);
      if (dummyProperty) {
        return { success: true, data: dummyProperty };
      }
      throw error;
    }
  },

  // Create new property
  createProperty: async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  // Delete property
  deleteProperty: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  // Toggle Publish Status
  togglePublish: async (id) => {
    const response = await api.put(`/properties/${id}/publish`);
    return response.data;
  },

  // Toggle Room Availability
  toggleRoomAvailability: async (propertyId, roomTypeId) => {
    const response = await api.put(`/properties/${propertyId}/rooms/${roomTypeId}/availability`);
    return response.data;
  }
};

export default propertyService;