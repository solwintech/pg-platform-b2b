import api from './api';

const reviewService = {
  // Get all reviews (Admins see all, public see approved)
  getReviews: async () => {
    try {
      const response = await api.get('/reviews');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get reviews for a specific property
  getPropertyReviews: async (propertyId) => {
    try {
      const response = await api.get(`/properties/${propertyId}/reviews`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add review to a property
  addReview: async (propertyId, reviewData) => {
    try {
      const response = await api.post(`/properties/${propertyId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update review status (Admin only)
  updateReviewStatus: async (reviewId, status) => {
    try {
      const response = await api.put(`/reviews/${reviewId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reply to a review (Admin or Owner)
  replyToReview: async (reviewId, reply) => {
    try {
      const response = await api.put(`/reviews/${reviewId}/reply`, { reply });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default reviewService;
