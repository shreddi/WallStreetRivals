import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './apiService.ts';

export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/login/`, { username, password });
        if (response.data.access) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;  // Set token in headers for subsequent requests
        }
        return response.data;
    } catch (e: unknown) {
        // Check for network errors or specific error statuses
        const error = e as AxiosError
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

export const register = async (
    username: string,
    email: string,
    password: string,
    password2: string,
    first_name: string,
    last_name: string,
) => {
    try {
        await axios.post(`${API_BASE_URL}/api/register/`, {
            username,
            email,
            password,
            password2,
            first_name,
            last_name,
        });
    } catch (error: unknown) {
        // Check if error is an AxiosError
        if (axios.isAxiosError(error) && error.response && error.response.data) {
            const errorMessages = error.response.data;

            // You can now access field-specific errors, e.g., errorMessages.username, errorMessages.email, etc.
            throw errorMessages; // Pass the error object to wherever you handle the frontend display
        } else {
            // Handle unexpected errors
            throw { general: "Registration failed due to an unknown error." };
        }
    }
};