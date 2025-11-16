import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const issueAPI = {
  // Get all issues with filters
  getIssues: (params) => api.get('/issues', { params }),
  
  // Get single issue
  getIssue: (id) => api.get(`/issues/${id}`),
  
  // Create issue
  createIssue: (formData) => api.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Update issue
  updateIssue: (id, data) => api.put(`/issues/${id}`, data),
  
  // Delete issue
  deleteIssue: (id) => api.delete(`/issues/${id}`),
  
  // Upvote issue
  upvoteIssue: (id) => api.post(`/issues/${id}/upvote`),
  
  // Add comment
  addComment: (id, text) => api.post(`/issues/${id}/comments`, { text }),
  
  // Get nearby issues
  getNearbyIssues: (longitude, latitude, params) => 
    api.get(`/issues/nearby/${longitude}/${latitude}`, { params }),
  
  // Get statistics
  getStats: () => api.get('/issues/stats')
};

export const notificationAPI = {
  // Get notifications
  getNotifications: (params) => api.get('/notifications', { params }),
  
  // Mark as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  // Mark all as read
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  // Delete notification
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

export default api;