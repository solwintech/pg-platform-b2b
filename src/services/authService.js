import api from './api';

const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Helper: Get user from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Helper: Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Generate OTP
  generateOtp: async (mobile) => {
    const response = await api.post('/auth/generate-otp', { mobile });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (mobile, otp) => {
    const response = await api.post('/auth/verify-otp', { mobile, otp });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Update user details
  updateDetails: async (details) => {
    const response = await api.put('/auth/details', details);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Update profile image
  updateProfileImage: async (formData) => {
    const response = await api.put('/auth/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/updatepassword', passwordData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }
};

export default authService;