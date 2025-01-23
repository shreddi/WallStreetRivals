import axios from 'axios';
import { buildUrl, getAuthHeaders } from './apiService.ts';


export const getOpenContests = async () => {
    const headers = getAuthHeaders()

    try {
        const response = await axios.get(buildUrl(`/api/contests/open`), {headers, withCredentials: true});
        return response.data;
    } catch (error) {
        console.error(`Failed to get open contests: `, error);
        throw error;
    }
}

export const getMyContests = async () => {
    const headers = getAuthHeaders()

    try {
        const response = await axios.get(buildUrl(`/api/contests/mine`), {headers, withCredentials: true});
        return response.data;
    } catch (error) {
        console.error(`Failed to get current user's contests: `, error);
        throw error;
    }
}

export const createContest = async (formData: FormData) => {
    const headers = getAuthHeaders()

    try {
        const response = await axios.post(buildUrl(`/api/contests/`), formData, {headers, withCredentials: true});
        return response.data;
    } catch (error) {
        console.error(`Failed create contest: `, error);
        throw error;
    }
}

export const getSingleContest = async (contestID: number) => {
    const headers = getAuthHeaders()
    
    try {
        const response = await axios.get(buildUrl(`/api/contests/${contestID}/`), {headers, withCredentials: true});
        return response.data;
    } catch (error) {
        console.error(`Failed to get contest: `, error);
        throw error;
    }
}