import api from './api';

const propertyService = {
  // Get all properties (filtered by owner in backend if B2B)
  getProperties: async () => {
    const response = await api.get('/properties');
    return response.data;
  },

  // Get single property by ID
  getPropertyById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
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