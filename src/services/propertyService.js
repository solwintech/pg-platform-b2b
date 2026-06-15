import api from './api';
import { dummyProperties } from './dummyData';
const buildFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'coverImageFile') {
      if (data.coverImageFile) formData.append('coverImage', data.coverImageFile);
    } else if (key === 'galleryImages') {
      const galleryTags = [];
      const existingImages = [];
      if (Array.isArray(data.galleryImages)) {
        data.galleryImages.forEach(img => {
          if (img.file) {
            formData.append('galleryImages', img.file);
            galleryTags.push(img.tag || '');
          } else {
            existingImages.push(img);
          }
        });
        
        formData.append('galleryTags', JSON.stringify(galleryTags));
        if (existingImages.length > 0) {
          formData.append('galleryImages', JSON.stringify(existingImages));
        }
      }
    } else if (key === 'coverImage') {
      if (!data.coverImageFile && data.coverImage) {
         formData.append('coverImage', data.coverImage);
      }
    } else if (key === 'roomTypes') {
      const roomTypesArray = [];
      if (Array.isArray(data.roomTypes)) {
        data.roomTypes.forEach((rt) => {
          const rtCopy = { ...rt };
          if (rtCopy.imageFile) {
            formData.append('roomImages', rtCopy.imageFile);
            rtCopy.hasNewImage = true;
            delete rtCopy.imageFile;
          } else {
            rtCopy.hasNewImage = false;
          }
          roomTypesArray.push(rtCopy);
        });
      }
      formData.append('roomTypes', JSON.stringify(roomTypesArray));
    } else {
      if (typeof data[key] === 'object' && data[key] !== null) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }
  });
  return formData;
};

const propertyService = {
  // Get all properties (filtered by owner in backend if B2B)
  getProperties: async (params = {}, includeDummy = false) => {
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
      throw error;
    }
  },

  // Create new property
  createProperty: async (propertyData) => {
    const formData = buildFormData(propertyData);
    const response = await api.post('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    const formData = buildFormData(propertyData);
    const response = await api.put(`/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
  },

  // Increment Views (Clicks)
  incrementViews: async (id) => {
    try {
      const response = await api.put(`/properties/${id}/click`);
      return response.data;
    } catch (error) {
      console.error('Failed to increment views:', error);
      return { success: false };
    }
  }
};

export default propertyService;