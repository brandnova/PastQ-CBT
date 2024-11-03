// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://qbank.backend.kumotechs.com/api',
  withCredentials: true,
});

// Add a request interceptor to add the token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;