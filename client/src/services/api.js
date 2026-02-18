import axios from 'axios';

// This will work both locally and on Vercel
const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api'  // Vercel will proxy this to serverless function
    : 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for debugging
API.interceptors.request.use(request => {
  console.log('API Request:', request.method, request.url);
  return request;
});

// Response interceptor for error handling
API.interceptors.response.use(
  response => {
    console.log('API Response:', response.status);
    return response;
  },
  error => {
    console.error('API Error:', error.message);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    return Promise.reject(error);
  }
);

export const getUsers = () => API.get('/users');
export const getUser = (id) => API.get(`/users/${id}`);
export const getUserTransactions = (id) => API.get(`/users/${id}/transactions`);
export const getUserRisk = (id) => API.get(`/users/${id}/risk`);
export const addTransaction = (id, data) => API.post(`/users/${id}/transactions`, data);
export const getStats = () => API.get('/stats');
export const healthCheck = () => API.get('/health');

export default API;
