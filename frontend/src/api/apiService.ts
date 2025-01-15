import { AxiosRequestHeaders } from 'axios';

// Base backend URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//Helper to create full URLs
export const buildUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

//Function to get auth headers using cookies for APIs requiring verification.
export function getAuthHeaders(): AxiosRequestHeaders['headers'] {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token available');
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }  

//export API services from other files 
export * from './portfolioService'
export * from './authService'
export * from './contestService'