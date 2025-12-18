import axios from 'axios';

const API_URL = '/api'; // Relative path for Next.js API routes

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use(config => {
  // Always get the fresh token from localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;

