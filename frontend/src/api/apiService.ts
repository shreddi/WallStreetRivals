// Base backend URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//Helper to create full URLs
export const buildUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

//Reusable Axios configuration
export const axiosConfig = { headers: { 'Content-Type': 'application/json' } };

export * from './portfolioService'
export * from './authService'