import axios from 'axios';
import { API_BASE_URL } from './apiService.ts';

export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/login/`, { username, password });
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);  // Store access token
            localStorage.setItem('refresh_token', response.data.refresh); // Store refresh token
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;  // Set token in headers for subsequent requests
        }
        return response.data;
    } catch (error) {
        // Check for network errors or specific error statuses
        if (error.response) {
            // Server responded with a status code outside of 2xx
            if (error.response.status === 400) {
                throw new Error('Invalid username or password.');
            } else if (error.response.status === 401) {
                throw new Error('Unauthorized: Invalid credentials.');
            } else if (error.response.status === 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                // Other status codes
                throw new Error(error.response.data?.detail || 'Login failed. Please check your input.');
            }
        } else if (error.request) {
            // Request was made, but no response received
            throw new Error('Network error. Please check your internet connection.');
        } else {
            // Something else went wrong in the request setup
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }
};
