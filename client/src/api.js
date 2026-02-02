import axios from 'axios';

// In production on Vercel, the API is served from the same domain under `/api`.
// In local dev, Vite proxies `/api` to the backend (see vite.config.mjs).
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
