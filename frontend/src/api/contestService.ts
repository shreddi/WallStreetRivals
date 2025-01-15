import axios from 'axios';
import { Contest } from '../types.ts'
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