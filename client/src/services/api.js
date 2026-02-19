import axios from 'axios';

// Smart baseURL that works everywhere
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use relative URLs (works on Vercel)
    return '';
  }
  // In development, use localhost
  return 'http://localhost:5000';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for debugging
API.interceptors.request.use(request => {
  console.log('🚀 API Request:', request.method.toUpperCase(), request.url);
  return request;
});

// Response interceptor
API.interceptors.response.use(
  response => {
    console.log('✅ API Response:', response.status);
    return response;
  },
  error => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// API functions
export const getUsers = () => API.get('/api/users');
export const getUser = (id) => API.get(`/api/users/${id}`);
export const getUserTransactions = (id) => API.get(`/api/users/${id}/transactions`);
export const getUserRisk = (id) => API.get(`/api/users/${id}/risk`);
export const addTransaction = (id, data) => API.post(`/api/users/${id}/transactions`, data);
export const getStats = () => API.get('/api/stats');
export const testAPI = () => API.get('/api/test');
export const healthCheck = () => API.get('/api/health');

export default API;
