import axios, { AxiosError } from 'axios';
import { API_BASE_URL, getAuthHeaders } from './apiService.ts';
import { Player } from '../types.ts';

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

export const updatePlayer = async (playerID: number, formData: FormData) => {
    const headers = getAuthHeaders()
    const response = await axios.put(`${API_BASE_URL}/api/players/${playerID}/`, formData, { headers, withCredentials: true })
    if (response.status !== 200) {
        throw new Error('failed to update player');
    }
    return response.data
}

export const getPlayer = async (playerID: number) => {
    const headers = getAuthHeaders()
    const response = await axios.get(`${API_BASE_URL}/api/players/${playerID}/`, { headers, withCredentials: true })
    if (response.status !== 200) {
        throw new Error('failed to get player');
    }
    return response.data
}

export const getAllPlayers = async () => {
    const headers = getAuthHeaders()
    const response = await axios.get(`${API_BASE_URL}/api/players/`, { headers, withCredentials: true })
    if (response.status !== 200) {
        throw new Error('failed to get all players');
    }
    return response.data
}

export const searchPlayers = async (query: string) => {
    const headers = getAuthHeaders()
    const response = await axios.get(`${API_BASE_URL}/api/players/?search=${query}`, { headers, withCredentials: true })
    if (response.status !== 200) {
        throw new Error('failed to get players from query.');
    }
    return response.data
}

export const resetPassword = async (email: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/password_reset/`, { email });
        return response.data
    } catch (err) {
        throw new Error("failed to reset password.")
    }
};